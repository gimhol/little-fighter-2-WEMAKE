import type { IPictureInfo } from "./IPictureInfo";
import { fields, int, str } from "../fields";

/**
 * 实体图片信息
 *
 * TODO 补充说明
 *
 * @export
 * @interface ILegacyPictureInfo
 */
export interface ILegacyPictureInfo extends IPictureInfo {
  /**
   * 行数
   *
   * @type {number}
   */
  row: number;

  /**
   * 列数
   *
   * @type {number}
   */
  col: number;

  /**
   * 格宽
   *
   * @type {number}
   */
  cell_w: number;

  /**
   * 格高
   *
   * @type {number}
   */
  cell_h: number;
}

export const legacy_picture_info_fields = fields<ILegacyPictureInfo>({
  id: str('图片ID'),
  path: str('路径'),
  variants: str('变体', { array: true }),
  row: int('行数'),
  col: int('列数'),
  cell_w: int('格宽'),
  cell_h: int('格高'),
});