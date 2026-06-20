import { validate_schema } from "../../utils/schema/validate_schema";
import type { IUIImgInfo } from "../IUIImgInfo.dat";
import { Schema_IUIImgInfo } from "../Schema_IUIImgInfo";

export function validate_ui_img_info(any: any, errors: string[] = [], warnings: string[] = []): any is IUIImgInfo {
  const fn = 'validate_ui_img_info';
  return validate_schema(any, Schema_IUIImgInfo, errors);
}
validate_ui_img_info.TAG = 'validate_ui_img_info'