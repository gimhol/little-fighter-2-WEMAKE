import { texture_loader } from "@/LF2/loader/ImageMgr";
import img_white from "@/assets/white.png"
export function white_texture() {
  return texture_loader.load(img_white);
}
