import type { IBdyInfo } from "../defines";
export function edit_bdy_info(
  src: IBdyInfo,
  ...edit: Partial<IBdyInfo>[]
): void {
  Object.assign(src, ...edit);
}
