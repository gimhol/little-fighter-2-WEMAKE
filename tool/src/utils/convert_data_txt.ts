import { warn } from "console";
import { X_OK } from "constants";
import { accessSync, writeFileSync } from "fs";
import { read_indexes } from "../../../src/LF2/dat_translator/read_indexes";
import type { IDataLists } from "../../../src/LF2/defines/IDataLists";
import { is_file } from "./is_file";
import { debug, info } from "./log";
import { read_text_file } from "./read_text_file";
import { write_obj_file } from "./write_obj_file";
async function parse_indexes(
  src_path: string,
  suffix: 'json5' | 'json'
): Promise<IDataLists> {
  const text = await read_text_file(src_path);
  debug(`[parse_indexes] text:\n`, text)
  const ret = read_indexes(text, suffix);
  if (typeof ret === 'string') throw new Error(ret);
  return ret;
}
export async function convert_data_txt(
  src_dir: string,
  out_dir: string,
): Promise<IDataLists | undefined> {
  debug(
    `convert_data_txt(
  src_dir = ${JSON.stringify(src_dir)},
  out_dir = ${JSON.stringify(out_dir)}, 
)`)
  const suffix = 'json5'
  const src_path = `${src_dir}/data/data.txt`;
  try {
    accessSync(src_path, X_OK)
  } catch (e) {
    warn([
      `data.txt not found, path:`,
      `"${src_path}"\n`,
      "Will create it for you, please edit it and retry again."
    ].join('\n    '))
    writeFileSync(src_path, `
[NOT_READY] Please remove this line after the editing or LF2W-TOOL will not use this file.
<object>
<object_end>
<background>
<background_end>
`.trim())
    return void 0;
  }
  const stage_path = `${src_dir}/data/stage.dat`;
  const dst_path = `${out_dir}/data/data.index.${suffix}`;
  info("convert", src_path, "=>\n    "+ dst_path);
  const indexes = await parse_indexes(src_path, suffix)
  if (await is_file(stage_path)) {
    indexes.stages = [{
      id: "default_stages",
      type: "stage",
      file: "data/stage.stage.json5",
    }]
  }
  await write_obj_file(dst_path, indexes);
  return indexes;
}
export async function write_index_file(indexes: IDataLists, out_dir: string) {
  const suffix = 'json5'
  const dst_path = `${out_dir}/data/data.index.${suffix}`;
  await write_obj_file(dst_path, indexes);
}