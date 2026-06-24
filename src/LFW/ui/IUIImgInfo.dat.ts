import { make_schema } from "../utils/schema";

/**
 * 处理顺序:
 * - 会先根据(x,y,w,h)对原图裁剪
 *   - x默认0
 *   - y默认0
 *   - w默认原图宽
 *   - h默认原图高
 * - 在缩放至(dw,dh)
 *   - dw默认 = w
 *   - dh默认 = h
 * - 根据(flip_x,flip_y)上下反转
 */
export interface IUIImgInfo {
  path: string;

  /** 
   * 裁剪起始X坐标 
   * 
   * default: 0
   */
  x?: number;

  /** 
   * 裁剪起始Y坐标 
   * 
   * default: 0
   */
  y?: number;

  /** 
   * 裁剪源宽 
   * 
   * default: 源图宽
   */
  w?: number;

  /** 
   * 裁剪源高 
   * 
   * default: 源图高
   */
  h?: number;

  /** 
   * 目标宽度 
   * 
   * 默认 = w
   */
  dw?: number;

  /** 
   * 目标高度
   * 
   * 默认 = h
   */
  dh?: number;

  /**
   * 是否水平翻转
   */
  flip_x?: 0 | 1;

  /**
   * 是否垂直翻转
   */
  flip_y?: 0 | 1;

  wrapS?: number;
  wrapT?: number;
  offsetX?: number;
  offsetY?: number;
  offsetAnimX?: number;
  offsetAnimY?: number;
  offsetAnimR?: number;
  repeatX?: number;
  repeatY?: number;
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

export const Schema_IUIImgInfo = make_schema<IUIImgInfo>({
  key: "IUIImgInfo",
  type: "object",
  properties: {
    nine_patch: { type: 'object', nullable: true },
    path: { type: 'string', string: { not_blank: true } },
    x: { type: 'number', number: { int: true, nagetive: false }, nullable: true },
    y: { type: 'number', number: { int: true, nagetive: false }, nullable: true },
    w: { type: 'number', number: { int: true, positive: true }, nullable: true },
    h: { type: 'number', number: { int: true, positive: true }, nullable: true },
    dw: { type: 'number', number: { int: true, positive: true }, nullable: true },
    dh: { type: 'number', number: { int: true, positive: true }, nullable: true },
    wrapS: { type: 'number', nullable: true },
    wrapT: { type: 'number', nullable: true },
    offsetX: { type: 'number', nullable: true },
    offsetY: { type: 'number', nullable: true },
    offsetAnimX: { type: 'number', nullable: true },
    offsetAnimY: { type: 'number', nullable: true },
    offsetAnimR: { type: 'number', nullable: true },
    repeatX: { type: 'number', nullable: true },
    repeatY: { type: 'number', nullable: true },
    flip_x: { type: 'number', oneof: [0, 1], nullable: true },
    flip_y: { type: 'number', oneof: [0, 1], nullable: true },
  },
});