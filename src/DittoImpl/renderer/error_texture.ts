import { texture_loader } from "@/DittoImpl/ImageMgr/ImageMgr";
import img_error from "@/assets/error.png"
export function error_texture() {
  return texture_loader.load(img_error);
}
