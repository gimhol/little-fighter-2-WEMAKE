import { validate_schema } from "@/LF2/utils/schema";
import { is_positive_int } from "../../utils";
import { IUIImgInfo, Schema_IUIImgInfo } from "../IUIImgInfo.dat";

export function validate_ui_img_info(any: any, errors: string[] = [], warnings: string[] = []): any is IUIImgInfo {
  const fn = 'validate_ui_img_info';
  let ret: boolean;
  if (ret = validate_schema(any, Schema_IUIImgInfo, errors)) {
    if ('col' in any !== 'row' in any) {
      ret = false;
      errors.push(`[${fn}]col, row should both be set!`)
    }
    if (('col' in any || 'row' in any) && !('w' in any) || !('h' in any)) {
      ret = false;
      errors.push(`[${fn}]w and h are required when col and row are set!`);
    }
    if ('count' in any && !is_positive_int(any.count)) {
      ret = false;
      errors.push(`[${fn}]count must be a positive integer or undefiend, but got ${any.count}`);
    }
  }
  return ret;
}
validate_ui_img_info.TAG = 'validate_ui_img_info'