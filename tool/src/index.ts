
import { zip } from "compressing";
import { createWriteStream } from "fs";
import { join } from "path";
import { pipeline } from "stream/promises";
import { data_2_txt } from "./data_2_txt";
import { make_data_zip } from "./make_data_zip";
import { make_prel_zip } from "./make_prel_zip";
import { read_conf } from "./read_conf";
import { show_main_usage } from "./show_main_usage";
import { write_file } from "./utils/write_file";

enum CMDEnum {
  MAIN = "main",
  HELP = 'help',
  DAT_2_TXT = 'dat-2-txt',
  MAKE_DATA = 'make-data',
  MAKE_PREL = 'make-prel',
  ZIP_FULL = 'zip-full',
}
async function make_full_zip() {
  const {
    OUT_DIR, PREL_ZIP_NAME, DATA_ZIP_NAME, FULL_ZIP_NAME
  } = await read_conf();

  const prel_zip_path = join(OUT_DIR, PREL_ZIP_NAME)
  const data_zip_path = join(OUT_DIR, DATA_ZIP_NAME)
  const index_path = join(OUT_DIR, 'index.json')
  const index_str = JSON.stringify([
    PREL_ZIP_NAME,
    DATA_ZIP_NAME
  ])
  await write_file(index_path, index_str)
  const zip_stream = new zip.Stream();
  zip_stream.addEntry(prel_zip_path)
  zip_stream.addEntry(data_zip_path)
  zip_stream.addEntry(index_path)

  const full_zip_path = join(OUT_DIR, FULL_ZIP_NAME)
  const dest_stream = createWriteStream(full_zip_path);
  await pipeline(zip_stream, dest_stream);
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
      const { LF2_PATH, TXT_LF2_PATH } = await read_conf();
      return data_2_txt(LF2_PATH, TXT_LF2_PATH);
    case CMDEnum.HELP:
      return show_main_usage();
    default:
      console.log(`unknown cmd, should be one of those: [${Object.keys(CMDEnum).map(k => (CMDEnum as any)[k]).join(', ')}]`)
      show_main_usage();
      break
  }
}

main()

