import { readFileSync } from "fs";
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
  EXTRA_PATH: string;
  TXT_LF2_PATH: string;
  DATA_DIR_PATH: string;
  FFMPEG_CMD: string;
  MAGICK_CMD: string;
  CONF_FILE_PATH?: string;
  FULL_ZIP_NAME: string;
}
interface IArgInfo {
  key?: keyof IConf;
  argv: string[];
  default?: string;
}

const options_map: Record<keyof IConf, IArgInfo> = {
  LF2_PATH: { argv: ['-i', '--input'] },
  TEMP_DIR: { argv: ['-t', '--temp'], default: './temp' },
  OUT_DIR: { argv: ['-o', '--output'], default: './public' },
  DATA_ZIP_NAME: { argv: [], default: 'data.zip' },
  PREL_DIR_PATH: { argv: [] },
  PREL_ZIP_NAME: { argv: [], default: 'prel.zip' },
  EXTRA_PATH: { argv: [] },
  TXT_LF2_PATH: { argv: [] },
  DATA_DIR_PATH: { argv: [] },
  FFMPEG_CMD: { argv: ['--ffmpeg'], default: 'ffmpeg' },
  MAGICK_CMD: { argv: ['--magick'], default: 'magick' },
  CONF_FILE_PATH: { argv: ['-c', '--conf'], default: './converter.config.json5' },
  FULL_ZIP_NAME: { argv: [], default: 'lfw.full.zip' }
}
const options: IArgInfo[] = Object.keys(options_map).map(k => {
  const key = k as keyof IConf;
  const info = options_map[key]
  info.argv.unshift(`--${k}`);
  return { key, ...info }
})

let conf: IConf | null = null
export function read_conf(): IConf {
  if (conf) return conf;
  const argv_map: Partial<IConf> = {}
  Object.keys(options_map).forEach((k) => {
    const key = k as keyof IConf;
    const info = options_map[key]
    if (typeof info.default === 'string')
      argv_map[key] = info.default;
  })


  for (let i = 3; i < process.argv.length; i++) {
    const key = process.argv[i];
    const val = process.argv[i + 1];
    const option = options.find(v => v.key === key || v.argv.some(b => b === key))
    if (option) {
      argv_map[option.key!] = val;
      ++i;
    }
  }

  const conf_str = readFileSync(argv_map.CONF_FILE_PATH!).toString();
  const {
    LF2_PATH,
    TEMP_DIR = "./temp",
    OUT_DIR = "./public",
    DATA_ZIP_NAME = "data.zip",
    PREL_DIR_PATH,// = "./prel_data",
    PREL_ZIP_NAME = "prel.zip",
    EXTRA_PATH,
    FFMPEG_PATH = "ffmpeg",
    MAGICK_PATH = "magick",
    FULL_ZIP_NAME = 'lfw.full.zip'
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
    EXTRA_PATH,
    FULL_ZIP_NAME,
    TXT_LF2_PATH,
    DATA_DIR_PATH,
    FFMPEG_CMD: FFMPEG_PATH,
    MAGICK_CMD: MAGICK_PATH,
    ...argv_map,
  }
  return conf;
}
