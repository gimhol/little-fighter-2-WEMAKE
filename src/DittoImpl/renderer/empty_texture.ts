import { texture_loader } from "../../LF2/loader/ImageMgr";

export function empty_texture() {
  return texture_loader.load("");
}
