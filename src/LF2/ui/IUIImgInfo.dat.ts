import { make_schema } from "../utils/schema";
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
}
export const Schema_IUIImgInfo = make_schema<IUIImgInfo>({
  key: "IUIImgInfo",
  type: "object",
  properties: {
    path: { type: 'string', string: { not_blank: true } },
    x: { type: 'number', number: { int: true, nagetive: false }, nullable: true },
    y: { type: 'number', number: { int: true, nagetive: false }, nullable: true },
    w: { type: 'number', number: { int: true, positive: true }, nullable: true },
    h: { type: 'number', number: { int: true, positive: true }, nullable: true },
    dw: { type: 'number', number: { int: true, positive: true }, nullable: true },
    dh: { type: 'number', number: { int: true, positive: true }, nullable: true },
    col: { type: 'number', number: { int: true, positive: true }, nullable: true },
    row: { type: 'number', number: { int: true, positive: true }, nullable: true },
    count: { type: 'number', number: { int: true, positive: true }, nullable: true },
    wrapS: { type: 'number', nullable: true },
    wrapT: { type: 'number', nullable: true },
    offsetX: { type: 'number', nullable: true },
    offsetY: { type: 'number', nullable: true },
    offsetAnimX: { type: 'number', nullable: true },
    offsetAnimY: { type: 'number', nullable: true },
    repeatX: { type: 'number', nullable: true },
    repeatY: { type: 'number', nullable: true },
    flip_x: { type: 'number', oneof: [0, 1], nullable: true },
    flip_y: { type: 'number', oneof: [0, 1], nullable: true },
  },
})
