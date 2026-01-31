import fs, { rm } from "fs/promises";
import JSON5 from "json5";
import path from "path";
import type { ILegacyPictureInfo } from "../../src/LF2/defines";
import { conf } from "./conf";
import { CacheInfos } from "./utils/cache_infos";
import { classify } from "./utils/classify";
import { convert_dat_file } from "./utils/convert_dat_file";
import { convert_data_txt, write_index_file } from "./utils/convert_data_txt";
import { convert_pic, convert_pic_2 } from "./utils/convert_pic";
import { convert_sound } from "./utils/convert_sound";
import { copy_dir } from "./utils/copy_dir";
import { log } from "./utils/log";
import { make_zip_and_json } from "./utils/make_zip_and_json";
import { write_file } from "./utils/write_file";

export async function make_data_zip() {
  const {
    IN_LF2_DIR,
    IN_EXTRA_DIR,
    OUT_DIR,
    OUT_DATA_NAME,
    TMP_DIR,
    TMP_DAT_DIR,
    KEEP_MIRROR,
  } = conf;
  if (!IN_LF2_DIR)
    return log("'data zip' will not be created, because 'IN_LF2_DIR' is not set in 'conf file'.")
  if (!OUT_DIR)
    return log("'data zip' will not be created, because 'OUT_DIR' is not set in 'conf file'.")
  if (!OUT_DATA_NAME)
    return log("'data zip' will not be created, because 'OUT_DATA_NAME' is not set in 'conf file'.")
  if (!TMP_DIR)
    return log("'data zip' will not be created, because 'TMP_DIR' is not set in 'conf file'.")
  if (!TMP_DAT_DIR)
    return log("'data zip' will not be created, because 'TMP_DAT_DIR' is not set in 'conf file'.")

  const cache_infos = await CacheInfos.create(
    path.join(TMP_DIR, "cache_infos.json5")
  );
  const ress = await classify(IN_LF2_DIR);
  for (const src_path of ress.directories) {
    const dst_path = src_path.replace(IN_LF2_DIR, TMP_DAT_DIR);
    await fs.mkdir(dst_path, { recursive: true }).catch((_) => void 0);
  }

  const pic_list_map = new Map<string, ILegacyPictureInfo[]>();
  const indexes = await convert_data_txt(IN_LF2_DIR, TMP_DAT_DIR);
  if (IN_EXTRA_DIR) await copy_dir(IN_EXTRA_DIR, TMP_DAT_DIR);
  if (!indexes) throw Error('dat index file not found!');
  if (indexes) {
    for (const src_path of ress.file.dat) {
      let type: 'bg' | 'obj' | 'index' | 'stage' = 'obj';
      const a = src_path.replace(IN_LF2_DIR, '');
      if (a.startsWith('/bg/') || a.startsWith('bg/'))
        type = 'bg';
      else if (src_path.endsWith('/stage.dat'))
        type = 'stage';
      else if (src_path.endsWith('/data.idx.dat'))
        type = 'index';

      else
        type = 'obj';

      const dst_path = convert_dat_file.get_dst_path(
        TMP_DAT_DIR,
        IN_LF2_DIR,
        src_path,
        type
      );
      const cache_info = await cache_infos.get_info(
        src_path,
        dst_path,
        "dat_v1"
      );
      const json = await convert_dat_file(
        TMP_DAT_DIR,
        src_path,
        dst_path,
        indexes
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
      TMP_DAT_DIR,
      IN_LF2_DIR,
      src_path
    );
    const pic_list = pic_list_map.get(
      dst_path.replace(TMP_DAT_DIR + "/", "")
    );
    if (!pic_list?.length) {
      if (dst_path.endsWith('_mirror.png') && !KEEP_MIRROR) {
        await rm(dst_path).catch(() => void 0)
        log("mirror pic ignored:", src_path);
        continue;
      }
      const cache_info = await cache_infos.get_info(src_path, dst_path);
      const is_changed = await cache_info.is_changed();
      if (!is_changed) {
        log("not changed:", src_path, "=>", dst_path);
        continue;
      }
      await convert_pic(TMP_DAT_DIR, IN_LF2_DIR, src_path);
      await cache_info.update();
    } else {
      for (const pic of pic_list) {
        const dst_path = convert_pic_2.get_dst_path(TMP_DAT_DIR, pic);
        if (dst_path.endsWith('_mirror.png') && !KEEP_MIRROR) {
          await rm(dst_path).catch(() => void 0)
          log("mirror pic ignored:", src_path);
          continue;
        }
        const cache_info = await cache_infos.get_info(src_path, dst_path);
        const is_changed = await cache_info.is_changed();
        if (!is_changed) {
          log("not changed:", src_path, "=>", dst_path);
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
      TMP_DAT_DIR,
      IN_LF2_DIR,
      src_path
    );
    const cache_info = await cache_infos.get_info(src_path, dst_path);
    const is_changed = await cache_info.is_changed();
    if (!is_changed) {
      log("not changed:", src_path, "=>", dst_path);
      continue;
    }
    await convert_sound(dst_path, src_path);
    await cache_info.update();
  }

  for (const src_path of ress.unknown) {
    const dst_path = src_path.replace(IN_LF2_DIR, TMP_DAT_DIR);
    const cache_info = await cache_infos.get_info(src_path, dst_path);
    const is_changed = await cache_info.is_changed();
    if (!is_changed) {
      log("not changed:", src_path, "=>", dst_path);
      continue;
    }
    log("copy", src_path, "=>", dst_path);
    await fs.copyFile(src_path, dst_path);
    await cache_info.update();
  }
  await cache_infos.save();
  await write_index_file(indexes, TMP_DAT_DIR);
  await make_zip_and_json(TMP_DAT_DIR, OUT_DIR, OUT_DATA_NAME, (inf) => {
    inf.type = 'data';
    return inf;
  });
}
