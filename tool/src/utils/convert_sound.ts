import command_exists from "command-exists";
import fs from "fs/promises";
import { read_argv } from "../read_argv";
import { exec_cmd } from "./exec_cmd";

function get_dst_path(
  out_dir: string,
  src_dir: string,
  src_path: string,
): string {
  return src_path.replace(src_dir, out_dir) + ".mp3";
}
export async function convert_sound(dst_path: string, src_path: string) {
  console.log("convert", src_path, "=>", dst_path);
  await fs.rm(dst_path, { recursive: true, force: true }).catch(() => void 0);
  const { FFMPEG_CMD } = await read_argv();
  if (!command_exists.sync(FFMPEG_CMD))
    throw new Error(
      "ffmpeg not found, download it from: https://ffmpeg.org/download.html",
    );

  const args = [
    "-i",
    src_path,
    "-codec:a",
    "libmp3lame",
    "-b:a",
    "64k",
    "-ar",
    "44100",
    dst_path,
  ];
  return await exec_cmd("ffmpeg", ...args);
}

convert_sound.get_dst_path = get_dst_path;
