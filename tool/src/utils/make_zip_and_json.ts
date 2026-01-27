import { zip } from "compressing";
import fs from "fs/promises";
import { join } from "path";
import { Defines } from "../../../src/LF2/defines";
import { file_md5_str } from "./file_md5_str";
import { is_dir } from "./is_dir";
import { write_file } from "./write_file";
import { write_obj_file } from "./write_obj_file";
import { read_full_dir_info_json } from "./read_full_dir_info_json";
export interface IDirInfo {
  type?: string,
  output?: string,
  description?: string,
  children?: { [x in string]?: IDirInfo }
}
export interface IZipFileInfo {
  url: string;
  md5: string;
  time: string;
  type: string;
  info?: { [x in string]?: any };
  version: number;
}
/**
 * 压缩源目录，生成zip文件与“信息json文件”
 *
 * 源目录本身会被忽略
 *
 * 会产生以下两个文件:
 *
 *    ${out_dir}/${zip_name}
 *
 *    ${out_dir}/${zip_name}.json
 *
 * @see {IZipFileInfo} 信息json文件的结构可见ZipFileInfo
 * @export
 * @async
 * @param {string} src_dir 源目录
 * @param {string} out_dir 输出目录
 * @param {string} zip_name 压缩文件名，需要包括后缀
 * @param {} edit_info 编辑最后信息文件
 * @returns {Promise<void>}
 */
export async function make_zip_and_json(
  src_dir: string,
  out_dir: string,
  zip_name: string,
  edit_info?: (info: IZipFileInfo) => IZipFileInfo | PromiseLike<IZipFileInfo>,
): Promise<void> {
  src_dir = src_dir.replace(/\\/g, "/");
  out_dir = out_dir.replace(/\\/g, "/");
  await fs.mkdir(out_dir, { recursive: true }).catch(e => e)
  console.log("zipping", src_dir, "=>", join(out_dir, zip_name));

  const layout_dir = src_dir + '/ui'
  const layout_index_file = src_dir + '/ui/_index.json5'
  await fs.unlink(layout_index_file).catch(() => { });
  await fs.readdir(layout_dir).then((names) => {
    const paths: string[] = []
    for (const name of names) {
      if (!name.match(/\.json[5?]?$/)) continue;
      paths.push('ui/' + name)
    }
    return write_obj_file(layout_index_file, paths)
  }).catch(e => { })

  if (!(await is_dir(src_dir)))
    throw new Error("[make_zip_and_json] src_dir " + src_dir + "不是目录");
  if (!(await is_dir(out_dir)))
    throw new Error("[make_zip_and_json] out_dir " + out_dir + "不是目录");

  const zip_path = join(out_dir, zip_name);
  const inf_path = join(out_dir, zip_name + ".json");
  await fs.unlink(zip_path).catch(() => { });
  await zip.compressDir(src_dir, zip_path, { ignoreBase: true });

  let inf: IZipFileInfo = {
    type: '',
    url: zip_name,
    md5: await file_md5_str(zip_path),
    info: await read_full_dir_info_json(src_dir),
    time: new Date().toISOString(),
    version: Defines.DATA_VERSION
  };
  inf = edit_info ? await edit_info(inf) : inf;
  await write_file(inf_path, JSON.stringify(inf));
}