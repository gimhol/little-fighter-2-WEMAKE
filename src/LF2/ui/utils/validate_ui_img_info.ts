import { is_positive_int } from "../../utils";
import { IUIImgInfo, Meta_IUIImgInfo } from "../IUIImgInfo.dat";
import { validate_object_with_metas } from "./validate_object_with_metas";

export function validate_ui_img_info(any: any, errors: string[] = [], warnings: string[] = []): any is IUIImgInfo {
  const fn = 'validate_ui_img_info';
  if (typeof any !== 'object') { errors.push(`${fn}] must be an object, but got ${any}`); return false; }
  let ret = true;
  const v = any as IUIImgInfo;
  validate_object_with_metas(v, Meta_IUIImgInfo, errors)
  if ('col' in v !== 'row' in v) { ret = false; errors.push(`[${fn}]col, row should both be set!`); }
  if (('col' in v || 'row' in v) && !('w' in v) || !('h' in v)) { ret = false; errors.push(`[${fn}]w and h are required when col and row are set!`); }
  if ('count' in v && !is_positive_int(v.count)) { ret = false; errors.push(`[${fn}]count must be a positive integer or undefiend, but got ${v.count}`); }
  return ret;
}
validate_ui_img_info.TAG = 'validate_ui_img_info'