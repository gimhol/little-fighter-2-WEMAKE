import fs from "fs/promises";
import { join } from "path/posix";
import { IDirInfo } from "./make_zip_and_json";
import { read_dir_info_json } from "./read_dir_info_json";

export async function read_full_dir_info_json(path: string): Promise<IDirInfo> {
  const ret = await read_dir_info_json(path);
  const items = await fs.readdir(path);
  for (const name of items) {
    const sub_path = join(path, name).replace(/\\/g, "/");
    const stat = await fs.stat(sub_path);
    if (!stat.isDirectory()) continue;
    const sub_info = await read_full_dir_info_json(sub_path);
    if (!Object.keys(sub_info).length) continue;
    ret.children = ret.children || {};
    ret.children[name] = sub_info;
  }
  return ret;
}
