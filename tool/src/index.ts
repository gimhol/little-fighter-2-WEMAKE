import { readFileSync } from "fs";
import fs from "fs/promises";
import JSON5 from "json5";
import path, { join } from "path";
import { ILegacyPictureInfo } from "../../src/LF2/defines/ILegacyPictureInfo";
import { data_2_txt } from "./data_2_txt";
import { CacheInfos } from "./utils/cache_infos";
import { check_is_str_ok } from "./utils/check_is_str_ok";
import { classify } from "./utils/classify";
import { convert_dat_file } from "./utils/convert_dat_file";
import { convert_data_txt, write_index_file } from "./utils/convert_data_txt";
import { convert_pic, convert_pic_2 } from "./utils/convert_pic";
import { convert_sound } from "./utils/convert_sound";
import { copy_dir } from "./utils/copy_dir";
import { make_zip_and_json } from "./utils/make_zip_and_json";
import { write_file } from "./utils/write_file";
const {
  RAW_LF2_PATH,
  TEMP_DIR,
  OUT_DIR,
  DATA_ZIP_NAME,
  PREL_DIR_PATH,
  PREL_ZIP_NAME,
  EXTRA_LF2_PATH,
} = JSON5.parse(readFileSync("./converter.config.json5").toString());

const TXT_LF2_PATH = join(TEMP_DIR, "lf2_txt")
const DATA_DIR_PATH = join(TEMP_DIR, "lf2_data")

enum EntryEnum {
  MAIN = 1,
  HELP,
  DAT_2_TXT,
  MAKE_PREL_ZIP,
  TOOL_DEV,
}
let entry = EntryEnum.MAIN;

for (let i = 2; i < process.argv.length; ++i) {
  switch (process.argv[i].toLowerCase()) {
    case "-h":
    case "--help":
      entry = EntryEnum.HELP;
      break;
    case "--make-prel-zip":
      entry = EntryEnum.MAKE_PREL_ZIP;
      break;
    case "--dat-2-txt":
      entry = EntryEnum.DAT_2_TXT;
      break;
    case "--tool-dev":
      entry = EntryEnum.TOOL_DEV;
      break;
  }
}

async function make_prel_zip() {
  await make_zip_and_json(PREL_DIR_PATH, OUT_DIR, PREL_ZIP_NAME, (inf) => {
    inf.type = 'prel'
    return inf;
  });
}

async function main() {
  check_is_str_ok(
    RAW_LF2_PATH,
    OUT_DIR,
    TEMP_DIR,
    DATA_ZIP_NAME,
    PREL_DIR_PATH,
    PREL_ZIP_NAME,
  );
  const cache_infos = await CacheInfos.create(
    path.join(TEMP_DIR, "cache_infos.json5"),
  );
  const ress = await classify(RAW_LF2_PATH);
  for (const src_path of ress.directories) {
    const dst_path = src_path.replace(RAW_LF2_PATH, DATA_DIR_PATH);
    await fs.mkdir(dst_path, { recursive: true }).catch((_) => void 0);
  }

  const pic_list_map = new Map<string, ILegacyPictureInfo[]>();

  const indexes = await convert_data_txt(RAW_LF2_PATH, DATA_DIR_PATH);
  if (EXTRA_LF2_PATH) await copy_dir(EXTRA_LF2_PATH, DATA_DIR_PATH)
  if (!indexes) throw Error('dat index file not found!')
  if (indexes) {
    for (const src_path of ress.file.dat) {
      let type: 'bg' | 'obj' | 'index' | 'stage' = 'obj'
      const a = src_path.replace(RAW_LF2_PATH, '')
      if (a.startsWith('/bg/') || a.startsWith('bg/'))
        type = 'bg'
      else if (src_path.endsWith('/stage.dat'))
        type = 'stage'
      else if (src_path.endsWith('/data.idx.dat'))
        type = 'index'
      else
        type = 'obj'

      const dst_path = convert_dat_file.get_dst_path(
        DATA_DIR_PATH,
        RAW_LF2_PATH,
        src_path,
        type,
      );
      const cache_info = await cache_infos.get_info(
        src_path,
        dst_path,
        "dat_v1",
      );
      const json = await convert_dat_file(
        DATA_DIR_PATH,
        src_path,
        dst_path,
        indexes,
      );
      if (!Array.isArray(json) && json) {
        let edited = false;
        for (const pic_name in json.base.files) {
          const file = json.base.files[pic_name];
          const key = file.path;
          const arr = pic_list_map.get(key);
          if (arr) {
            file.path = file.path.replace(/.png$/, `_${arr.length}.png`);
            edited = true;
            arr.push(file);
          } else {
            pic_list_map.set(key, [file]);
          }
        }
        if (edited) {
          await write_file(dst_path, JSON5.stringify(json, null, 2));
        }
      }
      await cache_info.update();
    }
  }
  const imgs = [...ress.file.bmp, ...ress.file.png];
  for (const src_path of imgs) {
    const dst_path = convert_pic.get_dst_path(
      DATA_DIR_PATH,
      RAW_LF2_PATH,
      src_path,
    );
    const pic_list = pic_list_map.get(
      dst_path.replace(DATA_DIR_PATH + "/", ""),
    );
    if (!pic_list?.length) {
      const cache_info = await cache_infos.get_info(src_path, dst_path);
      const is_changed = await cache_info.is_changed();
      if (!is_changed) {
        console.log("not changed:", src_path, "=>", dst_path);
        continue;
      }
      await convert_pic(DATA_DIR_PATH, RAW_LF2_PATH, src_path);
      await cache_info.update();
    } else {
      for (const pic of pic_list) {
        const dst_path = convert_pic_2.get_dst_path(DATA_DIR_PATH, pic);
        const cache_info = await cache_infos.get_info(src_path, dst_path);
        const is_changed = await cache_info.is_changed();
        if (!is_changed) {
          console.log("not changed:", src_path, "=>", dst_path);
          continue;
        }
        await convert_pic_2(dst_path, src_path, pic);
        await cache_info.update();
      }
    }
  }

  const sounds = [...ress.file.wav, ...ress.file.wma];
  for (const src_path of sounds) {
    const dst_path = convert_sound.get_dst_path(
      DATA_DIR_PATH,
      RAW_LF2_PATH,
      src_path,
    );
    const cache_info = await cache_infos.get_info(src_path, dst_path);
    const is_changed = await cache_info.is_changed();
    if (!is_changed) {
      console.log("not changed:", src_path, "=>", dst_path);
      continue;
    }
    await convert_sound(dst_path, src_path);
    await cache_info.update();
  }

  for (const src_path of ress.unknown) {
    const dst_path = src_path.replace(RAW_LF2_PATH, DATA_DIR_PATH);
    const cache_info = await cache_infos.get_info(src_path, dst_path);
    const is_changed = await cache_info.is_changed();
    if (!is_changed) {
      console.log("not changed:", src_path, "=>", dst_path);
      continue;
    }
    console.log("copy", src_path, "=>", dst_path);
    await fs.copyFile(src_path, dst_path);
    await cache_info.update();
  }
  await cache_infos.save();
  await write_index_file(indexes, DATA_DIR_PATH)
  await make_zip_and_json(DATA_DIR_PATH, OUT_DIR, DATA_ZIP_NAME, (inf) => {
    inf.type = 'data'
    return inf;
  });
  await make_prel_zip();
}

switch (entry) {
  case EntryEnum.MAIN:
    main();
    break;
  case EntryEnum.HELP:
    console.log("need_help");
    break;
  case EntryEnum.DAT_2_TXT:
    data_2_txt(RAW_LF2_PATH, TXT_LF2_PATH);
    break;
  case EntryEnum.MAKE_PREL_ZIP:
    make_prel_zip();
    break;
  case EntryEnum.TOOL_DEV:
    console.log('!')
    break;
}
