import fs from "fs/promises";
import { join } from "path/posix";
import { is_file } from "./is_file";
import { IDirInfo } from "./make_zip_and_json";

export async function read_dir_info_json(path: string): Promise<IDirInfo> {
  const ret: IDirInfo = {};
  const info_file = join(path, `__info.json`).replace(/\\/g, "/");
  if (!await is_file(info_file)) return ret;
  const raw = await fs.readFile(info_file).then((r) => JSON.parse(r.toString())).catch(() => {
    console.log('__info.json is not json')
    return {};
  });
  Object.assign(ret, raw);
  ret.type = typeof raw.type === 'string' ? raw.type : void 0;
  ret.output = typeof raw.output === 'string' ? raw.output : void 0;
  ret.description = typeof raw.description === 'string' ? raw.description : void 0;

  return ret;
}
