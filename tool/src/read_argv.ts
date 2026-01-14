import fs from "fs/promises";
import JSON5 from "json5";
import { join } from "path/posix";
import { check_is_str_ok } from "./utils/check_is_str_ok";

export async function read_argv(): Promise<{
  [x in string]: string;
}> {
  const conf_str = await fs.readFile("./converter.config.json5")
    .then(buf => buf.toString())
    .catch(e => "{}");
  const {
    LF2_PATH,
    TEMP_DIR = "./temp",
    OUT_DIR = "./public",
    DATA_ZIP_NAME = "data.zip",
    PREL_DIR_PATH = "./prel_data",
    PREL_ZIP_NAME = "prel.zip",
    EXTRA_LF2_PATH,
  } = JSON5.parse(conf_str);
  check_is_str_ok(["TEMP_DIR", TEMP_DIR]);
  const TXT_LF2_PATH = join(TEMP_DIR, "lf2_txt");
  const DATA_DIR_PATH = join(TEMP_DIR, "lf2_data");
  return {
    LF2_PATH,
    TEMP_DIR,
    OUT_DIR,
    DATA_ZIP_NAME,
    PREL_DIR_PATH,
    PREL_ZIP_NAME,
    EXTRA_LF2_PATH,
    TXT_LF2_PATH,
    DATA_DIR_PATH
  };
}
