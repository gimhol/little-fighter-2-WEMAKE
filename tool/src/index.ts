
import { data_2_txt } from "./data_2_txt";
import { make_data_zip } from "./make_data_zip";
import { make_prel_zip } from "./make_prel_zip";
import { read_conf } from "./read_conf";

enum CMDEnum {
  MAIN = "main",
  HELP = 'help',
  DAT_2_TXT = 'dat-2-txt',
  MAKE_DATA = 'make-data',
  MAKE_PREL = 'make-prel',
}

async function main() {
  switch (process.argv[2]?.toLowerCase()) {
    case CMDEnum.MAKE_DATA:
      return await make_data_zip();
    case CMDEnum.MAKE_PREL:
      return await make_prel_zip();
    case CMDEnum.MAIN:
      await make_data_zip();
      await make_prel_zip();
      return;
    case CMDEnum.DAT_2_TXT:
      const { LF2_PATH, TXT_LF2_PATH } = await read_conf();
      return data_2_txt(LF2_PATH, TXT_LF2_PATH);
    case CMDEnum.HELP:
      console.log("need_help");
      break;
    default:
      throw new Error(
        `unknown cmd, should be one of those: [${Object.keys(CMDEnum).map(k => (CMDEnum as any)[k]).join(', ')}]`
      )
      break
  }
}

main()