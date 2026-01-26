import { readFileSync } from "fs";
import JSON5 from "json5";

export interface IConf {
  CONF_FILE?: string;

  IN_LF2_DIR?: string;

  IN_PREL_DIR?: string;

  IN_EXTRA_DIR?: string;

  /**
   * 临时输出目录
   *
   * @default "./temp"
   * @type {string}
   * @memberof IConf
   */
  TMP_DIR?: string;

  /**
   * 临时文本输出目录（用于 dat-2-txt）
   * 
   * @default `${TMP_DIR}/lf2_txt` lf2_data
   * @type {string}
   * @memberof IConf
   */
  TMP_TXT_DIR?: string;

  /**
   * 临时数据输出目录（用于make-data）
   * 
   * @default `${TMP_DIR}/lf2_data`
   * @type {string}
   * @memberof IConf
   */
  TMP_DAT_DIR?: string;

  /**
   * 临时数据输出目录（用于make-data）
   * 
   * @default `${TMP_DIR}/lf2_data`
   * @type {string}
   * @memberof IConf
   */
  OUT_DIR?: string;
  OUT_DATA_NAME?: string;
  OUT_PREL_NAME?: string;

  /**
   * @default `lfw.full.zip`
   * @type {string}
   * @memberof IConf
   */
  OUT_FULL_NAME?: string;

  /**
   * 
   * @default `ffmpeg`
   * @type {string}
   * @memberof IConf
   */
  FFMPEG_CMD?: string;

  /**
   * 
   * @default `magick`
   * @type {string}
   * @memberof IConf
   */
  MAGICK_CMD?: string;

  KEEP_MIRROR?: string;
}
interface IArgInfo {
  key: keyof IConf;
  alias: string[];
  default?: string;
  boolean?: true;
}

const key_arg_records: Record<keyof IConf, Omit<IArgInfo, 'key'>> = {
  CONF_FILE: { alias: ['-c', '--conf'] },

  IN_LF2_DIR: { alias: ['-i', '--input'] },
  IN_PREL_DIR: { alias: [] },
  IN_EXTRA_DIR: { alias: [] },

  TMP_DIR: { alias: ['-t', '--temp'], default: './temp' },
  TMP_TXT_DIR: { alias: [], default: './temp/lf2_txt' },
  TMP_DAT_DIR: { alias: [], default: './temp/lf2_data' },

  OUT_DIR: { alias: ['-o', '--output'], default: './public' },
  OUT_DATA_NAME: { alias: [], default: 'data.zip' },
  OUT_PREL_NAME: { alias: [], default: 'prel.zip' },
  OUT_FULL_NAME: { alias: [], default: 'lfw.full.zip' },

  FFMPEG_CMD: { alias: ['--ffmpeg'], default: 'ffmpeg' },
  MAGICK_CMD: { alias: ['--magick'], default: 'magick' },
  KEEP_MIRROR: { alias: [], boolean: true },
}
const alias_arg_map = new Map<string, IArgInfo>();

Object.keys(key_arg_records).map(k => {
  const key = k as keyof IConf;
  const arg: IArgInfo = { key, ...key_arg_records[key] }
  arg.alias.unshift(`--${k}`);
  for (const a of arg.alias) alias_arg_map.set(a, arg)
})
export function make_conf(): Partial<IConf> {
  const conf: Partial<IConf> = {}

  Object.keys(key_arg_records).forEach((k) => {
    const key = k as keyof IConf;
    const info = key_arg_records[key]
    conf[key] = info.default || '';
  })
  for (let i = 3; i < process.argv.length; i++) {
    const key = process.argv[i];
    const info = alias_arg_map.get(key);
    if (!info) continue;
    if (info.boolean) {
      conf[info.key] = '1'
    } else {
      const value = process.argv[i + 1];
      conf[info.key] = value ?? ''
      ++i
    }
  }
  return conf;
}
function read_conf(): IConf {
  const conf: Partial<IConf> = make_conf();
  const { CONF_FILE } = conf;
  const conf_files = CONF_FILE ? [CONF_FILE] : [
    './conf.json5',
    './conf.json'
  ]
  for (const conf_file of conf_files) {
    try {
      const conf_str = readFileSync(conf_file).toString();
      const more = JSON5.parse(conf_str)
      Object.assign(conf, more)
      break;
    } catch (e) {

    }
  }
  return conf
}

function throw_blank(name: string, v: any): v is string {
  if (typeof v !== 'string') throw new Error(`"${name}" not set`)
  if (!v.trim()) throw new Error(`"${name}" got blank`)
  return true
}

export const conf: () => IConf = () => read_conf()
