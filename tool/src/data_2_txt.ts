import fs from "fs/promises";
import { join } from "path";
import { log } from "./utils/log";
import { read_lf2_dat_file } from "./utils/read_lf2_dat_file";

/**
 * 将dat文件转为txt文件
 * 
 * @export
 * @param {string} src_path 源路径
 * @param {string} dst_path 目标路径
 */
export async function data_2_txt(src_path: string, dst_path: string) {
  const stat = await fs.stat(src_path);

  if (stat.isFile()) {
    if (!src_path.endsWith(".dat")) return;
    dst_path = dst_path.replace(/.dat$/, ".txt");
    log(`data_2_txt: ${src_path} => ${dst_path}`);
    const data = await read_lf2_dat_file(src_path);
    await fs.writeFile(dst_path, data);
    return;
  }

  if (!stat.isDirectory()) return;
  await fs.mkdir(dst_path, { recursive: true });
  const names = await fs.readdir(src_path);
  for (const name of names) {
    await data_2_txt(
      join(src_path, name),
      join(dst_path, name)
    )
  }
}
