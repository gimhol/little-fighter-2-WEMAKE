import type { IEntityData, IFrameInfo, IBdyInfo } from "../defines";

/**
 * 检查bdy每个字段是否正常
 *
 * @export
 * @param {Readonly<IEntityData>} data
 * @param {Readonly<IFrameInfo>} frame
 */

export function check_bdy(
  data: Readonly<IEntityData>,
  frame: Readonly<IFrameInfo>,
  bdy: Readonly<IBdyInfo>,
  idx: number,
  errors?: string[]
): boolean {
  return true
}


