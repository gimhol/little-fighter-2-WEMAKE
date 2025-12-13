import { read_indexes } from "../../../src/LF2/dat_translator/read_indexes";
import { IDataLists } from "../../../src/LF2/defines/IDataLists";
import { read_text_file } from "./read_text_file";
import { write_obj_file } from "./write_obj_file";
async function parse_indexes(
  src_path: string,
  suffix: 'json5' | 'json'
): Promise<IDataLists | undefined> {
  const text = await read_text_file(src_path);
  return read_indexes(text, suffix);
}
export async function convert_data_txt(
  src_dir: string,
  out_dir: string,
  suffix: 'json5' | 'json',
  handler?: (indexes: IDataLists) => Promise<IDataLists> | IDataLists
): Promise<IDataLists | undefined> {
  const src_path = `${src_dir}/data/data.txt`;
  const dst_path = `${out_dir}/data/data.${suffix}`;
  console.log("convert", src_path, "=>", dst_path);
  const indexes = await parse_indexes(src_path, suffix).then(r => (r && handler) ? handler(r) : r);

  await write_obj_file(dst_path, indexes);
  return indexes;
}