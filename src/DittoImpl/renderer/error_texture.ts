import { texture_loader } from "../../LF2/loader/ImageMgr";
import img_error from "@/assets/error.png"
export function error_texture() {
  return texture_loader.load(img_error);
}
