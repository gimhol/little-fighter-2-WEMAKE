
import { data_2_txt } from "./data_2_txt";
import { read_argv } from "./read_argv";
import { make_prel_zip } from "./make_prel_zip";
import { make_data_zip } from "./make_data_zip";

enum EntryEnum {
  MAIN = "--main",
  HELP = '--help',
  DAT_2_TXT = '--dat-2-txt',
  MAKE_DATA_ZIP = '--make-prel-zip',
  MAKE_PREL_ZIP = '--make-data-zip',
}
let entry = EntryEnum.MAIN;

for (let i = 2; i < process.argv.length; ++i) {
  switch (process.argv[i].toLowerCase()) {
    case "-h":
      entry = EntryEnum.HELP;
      break;
    case EntryEnum.MAIN:
    case EntryEnum.HELP:
    case EntryEnum.MAKE_PREL_ZIP:
    case EntryEnum.MAKE_PREL_ZIP:
    case EntryEnum.DAT_2_TXT:
      entry = entry;
      break;
  }
}

async function main() {
  switch (entry) {
    case EntryEnum.MAKE_DATA_ZIP:
      await make_data_zip();
      break;
    case EntryEnum.MAKE_PREL_ZIP:
      await make_prel_zip();
      break;
    case EntryEnum.MAIN:
      await make_data_zip();
      await make_prel_zip();
      break;
    case EntryEnum.HELP:
      console.log("need_help");
      break;
    case EntryEnum.DAT_2_TXT:
      const { LF2_PATH, TXT_LF2_PATH } = await read_argv();
      await data_2_txt(LF2_PATH, TXT_LF2_PATH);
      break;
  }
}

main()