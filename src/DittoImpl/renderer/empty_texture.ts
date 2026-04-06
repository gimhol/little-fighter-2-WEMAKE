import { texture_loader } from "@/DittoImpl/ImageMgr/ImageMgr";

export function empty_texture() {
  return texture_loader.load("");
}
