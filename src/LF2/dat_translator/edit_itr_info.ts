import type { IItrInfo } from "../defines";

export function edit_itr_info(
  src: IItrInfo,
  ...edit: Partial<IItrInfo>[]
): void {
  Object.assign(src, ...edit);
}
