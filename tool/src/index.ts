
import { data_2_txt } from "./data_2_txt";
import { make_data_zip } from "./make_data_zip";
import { make_prel_zip } from "./make_prel_zip";
import { conf, make_conf } from "./conf";
import { show_main_usage } from "./show_main_usage";
import { print_ffmpeg_hints } from "./utils/convert_sound";
import { print_magick_hints } from "./utils/convert_pic";
import { make_full_zip } from "./make_full_zip";

enum CMDEnum {
  MAIN = "main",
  HELP = 'help',
  DAT_2_TXT = 'dat-2-txt',
  MAKE_DATA = 'make-data',
  MAKE_PREL = 'make-prel',
  ZIP_FULL = 'zip-full',
  MAKE_CONF = 'make-conf',
}
async function main() {
  switch (process.argv[2]?.toLowerCase()) {
    case CMDEnum.MAKE_DATA:
      await make_data_zip();
      await make_full_zip();
      return
    case CMDEnum.MAKE_PREL:
      await make_prel_zip();
      await make_full_zip();
      return;
    case CMDEnum.MAIN:
      await make_data_zip();
      await make_prel_zip();
      await make_full_zip();
      return;
    case CMDEnum.ZIP_FULL:
      await make_full_zip();
      return;
    case CMDEnum.DAT_2_TXT:
      const { IN_LF2_DIR, TMP_TXT_DIR } = conf();
      return data_2_txt(IN_LF2_DIR, TMP_TXT_DIR);
    case CMDEnum.MAKE_CONF:
      console.log('You can copy the content below into json file: \n\n ' + JSON.stringify(make_conf(), null, 2))
      return;
    case CMDEnum.HELP:
      return show_main_usage();
    default:
      console.log(`unknown cmd, should be one of those: [${Object.keys(CMDEnum).map(k => (CMDEnum as any)[k]).join(', ')}]`)
      show_main_usage();
      break
  }
}

main().then(() => {
  print_ffmpeg_hints();
  print_magick_hints();
})

