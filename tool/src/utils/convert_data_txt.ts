import { read_indexes } from "../../../src/LF2/dat_translator/read_indexes";
import type { IDataLists } from "../../../src/LF2/defines/IDataLists";
import { is_file } from "./is_file";
import { debug, info } from "./log";
import { read_text_file } from "./read_text_file";
import { write_obj_file } from "./write_obj_file";
async function parse_indexes(
  src_path: string,
  suffix: 'json5' | 'json'
): Promise<IDataLists | undefined> {
  const text = await read_text_file(src_path);
  debug(`[parse_indexes] text:\n`, text)
  return read_indexes(text, suffix);
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
  const stage_path = `${src_dir}/data/stage.dat`;
  const dst_path = `${out_dir}/data/data.index.${suffix}`;
  info("convert", src_path, "=>", dst_path);
  const indexes = await parse_indexes(src_path, suffix)
  if (indexes && await is_file(stage_path)) {
    indexes.stages = [{
      id: "default_stages",
      type: "stage",
      file: "data/stage.stage.json5",
    }]
  }
  info({ indexes })
  await write_obj_file(dst_path, indexes);
  return indexes;
}
export async function write_index_file(indexes: IDataLists, out_dir: string) {
  const suffix = 'json5'
  const dst_path = `${out_dir}/data/data.index.${suffix}`;
  await write_obj_file(dst_path, indexes);
}