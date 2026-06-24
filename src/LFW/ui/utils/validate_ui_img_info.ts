import { SchemaValidator } from "../../utils/schema/validate_schema";
import type { IUIImgInfo } from "../IUIImgInfo.dat";
import { Schema_IUIImgInfo } from "../IUIImgInfo.dat";

export function validate_ui_img_info(any: any, errors: string[] = [], warnings: string[] = []): any is IUIImgInfo {
  const validator = new SchemaValidator();
  const result = validator.validate(any, Schema_IUIImgInfo);
  errors.push(...validator.errors);
  warnings.push(...validator.warnings)
  return result;
}
validate_ui_img_info.TAG = 'validate_ui_img_info'