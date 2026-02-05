import fs from "fs/promises";
import { join } from "path/posix";
import { is_file } from "./is_file";
import { info } from "./log";
import { IDirInfo } from "./make_zip_and_json";

export async function read_dir_info_json(path: string): Promise<IDirInfo> {
  const info_file = join(path, `__info.json`).replace(/\\/g, "/");
  const ret: IDirInfo = { info_file, info_file_ok: false }
  if (!await is_file(info_file)) return ret;
  const raw = await fs.readFile(info_file).then((r) => JSON.parse(r.toString())).catch(() => {
    info('__info.json is not json')
    return {};
  });
  Object.assign(ret, raw);
  ret.info_file_ok = true; // not allow overwrite this value.
  ret.info_file = info_file; // not allow overwrite this value.
  ret.type = typeof raw.type === 'string' ? raw.type : void 0;
  ret.output = typeof raw.output === 'string' ? raw.output : void 0;
  ret.description = typeof raw.description === 'string' ? raw.description : void 0;
  ret.exists = true
  return ret;
}
