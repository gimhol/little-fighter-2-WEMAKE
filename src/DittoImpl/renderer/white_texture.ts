import { texture_loader } from "@/DittoImpl/ImageMgr";
import img_white from "@/assets/white.png"
export function white_texture() {
  return texture_loader.load(img_white);
}
