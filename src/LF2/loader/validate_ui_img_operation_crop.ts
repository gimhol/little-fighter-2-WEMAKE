import type { IImageOp_Crop } from "../ditto/image/IImageOp_Crop";
import { is_non_nagative_int, is_positive_int, is_undefined_or_number } from "../utils";

export function validate_ui_img_operation_crop(any: any, errors: string[] = []): any is IImageOp_Crop {
  const fn = 'validate_ui_img_operation_crop';
  if (typeof any !== 'object') { errors.push(`${fn}] must be an object, but got ${any}`); return false; }
  let ret = true;
  const v = any as IImageOp_Crop;
  if (v.type !== 'crop') { ret = false; errors.push(`[${fn}]type must be "crop" or, but got ${v.type}`); }
  if (void 0 !== v.x && !is_non_nagative_int(v.x)) { ret = false; errors.push(`[${fn}]x must be a non-negative integer or undefiend, but got ${v.x}`); }
  if (void 0 !== v.y && !is_non_nagative_int(v.y)) { ret = false; errors.push(`[${fn}]y must be a non-negative integer or undefiend, but got ${v.y}`); }
  if (void 0 !== v.w && !is_positive_int(v.w)) { ret = false; errors.push(`[${fn}]w must be a positive integer or undefiend, but got ${v.w}`); }
  if (void 0 !== v.h && !is_positive_int(v.h)) { ret = false; errors.push(`[${fn}]h must be a positive integer or undefiend, but got ${v.h}`); }
  if (void 0 !== v.dw && !is_positive_int(v.dw)) { ret = false; errors.push(`[${fn}]dw must be a positive integer or undefiend, but got ${v.dw}`); }
  if (void 0 !== v.dh && !is_positive_int(v.dh)) { ret = false; errors.push(`[${fn}]dh must be a positive integer or undefiend, but got ${v.dh}`); }
  return ret;
}
