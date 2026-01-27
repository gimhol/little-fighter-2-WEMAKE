import fs, { access, constants } from "fs/promises";
import JSON5 from "json5";

export async function is_file(path: string): Promise<boolean> {
  const exists = await access(path, constants.F_OK)
    .then(() => true)
    .catch(e => false)
  if (!exists) return false;
  const r = await fs.stat(path);
  return r.isFile();
}
export async function is_json(path: string): Promise<boolean> {
  return await is_file(path) && !!await fs.readFile(path).then(r => JSON5.parse(r.toString())).catch(_ => false)
}