import fs from "fs/promises";

const pwd = "SiuHungIsAGoodBearBecauseHeIsVeryGood";
const head_placeholder_length = 123;

export function decode_dat(arr: { [i in number]: number }, len: number) {
  for (let i = 0; i < len; ++i) arr[i] -= pwd.charCodeAt(i % pwd.length);
}

/**
 * 读取lf2文件的ArrayBuffer
 *
 * @export
 * @async
 * @param {ArrayBuffer} array_buffer 解密前内容
 * @returns {Promise<string>} 解密后内容
 */
export async function read_lf2_dat(array_buffer: ArrayBuffer): Promise<string> {
  const buf = new Uint8Array(array_buffer);
  decode_dat(buf, buf.byteLength);
  const char_code_arr = Array.from(buf);
  char_code_arr.splice(0, head_placeholder_length);
  return String.fromCharCode(...char_code_arr);
}

/**
 * 读取lf2文件
 *
 * @export
 * @async
 * @param {string} path 文件目录
 * @returns {Promise<string>} 解密后文件内容
 */
export async function read_lf2_dat_file(path: string): Promise<string> {
  const buf = await fs.readFile(path);
  if (path.endsWith('.dat')) decode_dat(buf, buf.length);
  else if (!path.endsWith('.txt')) throw new Error('[read_lf2_dat_file] only support ".dat" or ".txt"')
  const ret = Buffer.alloc(buf.length - head_placeholder_length);
  buf.copy(ret, 0, head_placeholder_length, buf.length);
  return ret.toString().replace(/\r/g, "");
}
