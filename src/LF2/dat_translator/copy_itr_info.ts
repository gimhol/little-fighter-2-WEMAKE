import type { IItrInfo } from "../defines";
import JSON5 from "json5"
export function copy_itr_info(
  src: IItrInfo,
  edit: Partial<IItrInfo>,
): IItrInfo {
  return { ...(JSON5.parse(JSON5.stringify(src)) as any), ...edit };
}
