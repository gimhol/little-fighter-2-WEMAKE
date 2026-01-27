
import { readFile } from "fs";
import { conf, make_conf, set_conf } from "./conf";
import { data_2_txt } from "./data_2_txt";
import { make_data_zip } from "./make_data_zip";
import { make_full_zip } from "./make_full_zip";
import { make_prel_zip } from "./make_prel_zip";
import { show_main_usage } from "./show_main_usage";
import { print_magick_hints } from "./utils/convert_pic";
import { print_ffmpeg_hints } from "./utils/convert_sound";
import { is_dir } from "./utils/is_dir";
import { is_json } from "./utils/is_file";
import { read_dir_info_json } from "./utils/read_dir_info_json";
import { write_file } from "./utils/write_file";
import { waitForKeyPress } from "./waitForKeyPress";
import path from "path";

enum CMDEnum {
  MAIN = "main",
  HELP = 'help',
  DAT_2_TXT = 'dat-2-txt',
  MAKE_DATA = 'make-data',
  MAKE_PREL = 'make-prel',
  ZIP_FULL = 'zip-full',
  PRINT_CONF = 'print-conf',
}
async function main() {
  const argv_2 = process.argv[2]
  switch (argv_2) {
    case CMDEnum.MAKE_DATA:
      await make_data_zip();
      await make_full_zip();
      return
    case CMDEnum.MAKE_PREL:
      await make_prel_zip();
      await make_full_zip();
      return;
    case CMDEnum.ZIP_FULL:
      await make_full_zip();
    case CMDEnum.MAIN:
      await make_data_zip();
      await make_prel_zip();
      await make_full_zip();
      return;
    case CMDEnum.DAT_2_TXT:
      const { IN_LF2_DIR, TMP_TXT_DIR } = conf();
      if (!IN_LF2_DIR) return console.log("failed! because 'IN_LF2_DIR' is not set in 'conf file'.")
      if (!TMP_TXT_DIR) return console.log("failed! because 'TMP_TXT_DIR' is not set in 'conf file'.")
      return data_2_txt(IN_LF2_DIR, TMP_TXT_DIR);
    case CMDEnum.PRINT_CONF:
      const json = {
        description: "You can copy it into json file. or run 'lf2w-tool print-conf > conf.json' to write it into 'conf.json'",
        ...make_conf()
      }
      delete json.CONF_FILE;
      console.log(JSON.stringify(json, null, 2))
      return;
    case CMDEnum.HELP:
      return show_main_usage();
    default:
      if (await is_dir(argv_2)) {
        const json = conf()
        const info = await read_dir_info_json(argv_2)
        const conf_file = json.CONF_FILE || `./${path.basename(argv_2)}.conf.json`
        console.log({ conf_file, dir_info_json: info })
        if (info.type === 'prel') {
          console.log(`got a dir, will try to zip it to 'prel zip'`)
          json.IN_PREL_DIR = argv_2
          if (typeof info.output === 'string') json.OUT_PREL_NAME
        } else {
          console.log(`got a dir, will try to zip it to 'data zip'`)
          json.IN_LF2_DIR = argv_2
          if (typeof info.output === 'string') json.OUT_DATA_NAME
        }
        await write_file(conf_file, JSON.stringify(json, null, 2))
        set_conf(conf_file)
        console.log({ conf: json })
        await make_data_zip();
        await make_prel_zip();
        await make_full_zip();
      } else if (await is_json(argv_2)) {
        console.log(`got a json file, will try to use it as 'conf file'`)
        await make_data_zip();
        await make_prel_zip();
        await make_full_zip();
      } else {
        console.log(`unknown cmd, should be one of those: [${Object.keys(CMDEnum).map(k => (CMDEnum as any)[k]).join(', ')}]`)
        show_main_usage();
      }
      break
  }
}

main().then(() => {
  print_ffmpeg_hints();
  print_magick_hints();
  waitForKeyPress();
}).catch((e) => {
  console.log(e)
  waitForKeyPress();
})
