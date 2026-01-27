import { statSync } from "fs";
import fs from "fs/promises";

export async function is_dir(path: string): Promise<boolean> {
  const r = await fs.stat(path);
  return r.isDirectory();
}
export function is_dir_sync(path: string): boolean {
  const r = statSync(path);
  return r.isDirectory();
}
