import { texture_loader } from "@/DittoImpl/ImageMgr";

export function empty_texture() {
  return texture_loader.load("");
}
