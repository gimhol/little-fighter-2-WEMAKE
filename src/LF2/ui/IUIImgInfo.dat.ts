import type { IMetas } from "../defines/IMetaInfo";

export interface IUIImgInfo {
  path: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  dw?: number;
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
export const Meta_IUIImgInfo: IMetas<IUIImgInfo> = {
  path: { name: 'path', type: 'string', string: { not_blank: true } },
  x: { name: 'x', type: 'number', number: { int: true, nagetive: false }, nullable: true, undefable: true },
  y: { name: 'y', type: 'number', number: { int: true, nagetive: false }, nullable: true, undefable: true },
  w: { name: 'w', type: 'number', number: { int: true, positive: true }, nullable: true, undefable: true },
  h: { name: 'h', type: 'number', number: { int: true, positive: true }, nullable: true, undefable: true },
  dw: { name: 'dw', type: 'number', number: { int: true, positive: true }, nullable: true, undefable: true },
  dh: { name: 'dh', type: 'number', number: { int: true, positive: true }, nullable: true, undefable: true },
  col: { name: 'col', type: 'number', number: { int: true, positive: true }, nullable: true, undefable: true },
  row: { name: 'row', type: 'number', number: { int: true, positive: true }, nullable: true, undefable: true },
  count: { name: 'count', type: 'number', number: { int: true, positive: true }, nullable: true, undefable: true },
  wrapS: { name: 'wrapS', type: 'number', nullable: true, undefable: true },
  wrapT: { name: 'wrapT', type: 'number', nullable: true, undefable: true },
  offsetX: { name: 'offsetX', type: 'number', nullable: true, undefable: true },
  offsetY: { name: 'offsetY', type: 'number', nullable: true, undefable: true },
  offsetAnimX: { name: 'offsetAnimX', type: 'number', nullable: true, undefable: true },
  offsetAnimY: { name: 'offsetAnimY', type: 'number', nullable: true, undefable: true },
  repeatX: { name: 'repeatX', type: 'number', nullable: true, undefable: true },
  repeatY: { name: 'repeatY', type: 'number', nullable: true, undefable: true },
  flip_x: { name: 'flip_x', type: 'number', oneof: [0, 1], nullable: true, undefable: true },
  flip_y: { name: 'flip_y', type: 'number', oneof: [0, 1], nullable: true, undefable: true },
}
