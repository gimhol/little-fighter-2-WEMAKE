import command_exists from "command-exists";
import fs from "fs/promises";
import { conf } from "../conf";
import { exec_cmd } from "./exec_cmd";
import { info } from "./log";

export let is_ffmpeg_tried = false;
function get_dst_path(
  out_dir: string,
  src_dir: string,
  src_path: string,
): string {
  return src_path.replace(src_dir, out_dir) + ".mp3";
}
export function print_ffmpeg_hints() {
  if (!is_ffmpeg_tried) return;
  const { FFMPEG_CMD } = conf;
  const is_ffmpeg_exists = FFMPEG_CMD && command_exists.sync(FFMPEG_CMD)
  if (is_ffmpeg_exists) return;
  const hints = `
ffmpeg not found, download it from: https://ffmpeg.org/download.html

All audio files will not be converted to MP3. 
However, you can convert them to MP3 in your own way.
Then you need to put it into output zip file yourself.

'lf2w-tool' currently only supports MP3.
`
  console.warn(hints)
}
export async function convert_sound(dst_path: string, src_path: string) {
  is_ffmpeg_tried = true;
  const { FFMPEG_CMD } = conf;
  const is_ffmpeg_exists = FFMPEG_CMD && command_exists.sync(FFMPEG_CMD)
  if (!is_ffmpeg_exists) return;
  info("convert", src_path, "=>", dst_path);
  await fs.rm(dst_path, { recursive: true, force: true }).catch(() => void 0);
  const args = [
    "-i",
    src_path,
    "-codec:a",
    "libmp3lame",
    "-b:a",
    "128k",
    "-ar",
    "44100",
    dst_path,
  ];
  return await exec_cmd("ffmpeg", ...args);
}

convert_sound.get_dst_path = get_dst_path;
