
export interface IImageOp_Crop {
  type: 'crop';

  /** 裁剪起始X坐标 */
  x?: number;

  /** 裁剪起始Y坐标 */
  y?: number;

  /** 裁剪源宽 */
  w?: number;

  /** 裁剪源高 */
  h?: number;

  /** 目标宽度 */
  dw?: number;

  /** 目标高度 */
  dh?: number;
}
