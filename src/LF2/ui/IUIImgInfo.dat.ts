export interface IUIImgInfo {
  path: string;

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

  col?: number;
  row?: number;
  count?: number;
  wrapS?: number;
  wrapT?: number;
  offsetX?: number;
  offsetY?: number;
  offsetAnimX?: number;
  offsetAnimY?: number;
  repeatX?: number;
  repeatY?: number;
  flip_x?: 0 | 1;
  flip_y?: 0 | 1;
  nine_patch?: INinePatch
}

export interface INinePatch {
  f_l?: number;
  f_t?: number;
  f_r?: number;
  f_b?: number;
  f_w?: number,
  f_h?: number,
  l_w?: number,
  t_h?: number,
  r_w?: number,
  b_h?: number,
}