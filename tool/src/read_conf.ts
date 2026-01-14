import fs from "fs/promises";
import JSON5 from "json5";
import { join } from "path/posix";
import { check_is_str_ok } from "./utils/check_is_str_ok";

interface IConf {
  LF2_PATH: string;
  TEMP_DIR: string;
  OUT_DIR: string;
  DATA_ZIP_NAME: string;
  PREL_DIR_PATH: string;
  PREL_ZIP_NAME: string;
  EXTRA_LF2_PATH: string;
  TXT_LF2_PATH: string;
  DATA_DIR_PATH: string;
  FFMPEG_CMD: string;
  MAGICK_CMD: string;
}
let conf: IConf | null = null
export async function read_conf(): Promise<IConf> {
  if (conf) return conf;
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
    FFMPEG_PATH = "ffmpeg",
    MAGICK_PATH = "magick",
  } = JSON5.parse(conf_str);
  check_is_str_ok(["TEMP_DIR", TEMP_DIR]);
  const TXT_LF2_PATH = join(TEMP_DIR, "lf2_txt");
  const DATA_DIR_PATH = join(TEMP_DIR, "lf2_data");
  conf = {
    LF2_PATH,
    TEMP_DIR,
    OUT_DIR,
    DATA_ZIP_NAME,
    PREL_DIR_PATH,
    PREL_ZIP_NAME,
    EXTRA_LF2_PATH,
    TXT_LF2_PATH,
    DATA_DIR_PATH,
    FFMPEG_CMD: FFMPEG_PATH,
    MAGICK_CMD: MAGICK_PATH
  }
  return conf;
}
