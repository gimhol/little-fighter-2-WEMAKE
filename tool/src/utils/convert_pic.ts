import command_exists from "command-exists";
import fs from "fs/promises";
import type { ILegacyPictureInfo } from "../../../src/LF2/defines/ILegacyPictureInfo";
import { conf } from "../conf";
import { exec_cmd } from "./exec_cmd";
export let is_magick_tried = false;
function get_dst_path(out_dir: string, src_dir: string, src_path: string) {
  return src_path.replace(src_dir, out_dir).replace(/(.bmp)$/, ".png");
}

export function print_magick_hints() {
  if (!is_magick_tried) return;
  const { MAGICK_CMD } = conf();
  const is_magick_exists = command_exists.sync(MAGICK_CMD)
  if (is_magick_exists) return;
  const hints = `
magick not found, download it from: https://imagemagick.org/script/download.php

All image files will not be converted to PNG. 
However, you can convert them to PNG in your own way.
And you need to remove the color from the transparent areas(the originally black parts of the BMP)
Then you need to put it into output zip file yourself.

'lf2w-tool' currently only supports PNG.
`
  console.warn(hints)
}

export async function convert_pic(
  out_dir: string,
  src_dir: string,
  src_path: string,
) {
  is_magick_tried = true;
  const { MAGICK_CMD } = conf();
  const is_magick_exists = command_exists.sync(MAGICK_CMD)
  if (!is_magick_exists) return;
  const dst_path = get_dst_path(out_dir, src_dir, src_path);
  await fs.rm(dst_path, { recursive: true, force: true }).catch((e) => void 0);
  console.log("convert pic 1", src_path, "=>", dst_path);
  await exec_cmd(
    "magick",
    src_path,
    "-alpha",
    "on",
    "-fill",
    "rgba(0,0,0,0)",
    "-opaque",
    "rgb(0,0,0)",
    dst_path,
  );
}
convert_pic.get_dst_path = get_dst_path;

export function get_dst_path_2(out_dir: string, pic: ILegacyPictureInfo) {
  return out_dir + "/" + pic.path;
}
export async function convert_pic_2(
  dst_path: string,
  src_path: string,
  pic: ILegacyPictureInfo,
) {
  is_magick_tried = true;
  const { MAGICK_CMD } = conf();
  const is_magick_exists = command_exists.sync(MAGICK_CMD)
  if (!is_magick_exists) return;
  const { col: row, row: col, cell_w, cell_h } = pic;
  const w = (cell_w + 1) * col;
  const h = (cell_h + 1) * row;
  console.log("convert pic 2", src_path, "=>", dst_path);
  const remove_lines: string[] = [];
  for (let col_idx = 0; col_idx < col; ++col_idx) {
    const x = (cell_w + 1) * (col_idx + 1) - 1;
    remove_lines.push("-draw", `line ${x},0 ${x},${h}`);
  }
  for (let row_idx = 0; row_idx < row; ++row_idx) {
    const y = (cell_h + 1) * (row_idx + 1) - 1;
    remove_lines.push("-draw", `line 0,${y} ${w},${y}`);
  }
  const args = [
    src_path,
    "-stroke",
    "rgba(0,0,0,0)",
    "-strokewidth",
    "1",
    ...remove_lines,
    "-alpha",
    "on",
    "-fill",
    "rgba(0,0,0,0)",
    "-opaque",
    "rgb(0,0,0)",
    dst_path,
  ];
  await exec_cmd("magick", ...args);
}

convert_pic_2.get_dst_path = get_dst_path_2;
