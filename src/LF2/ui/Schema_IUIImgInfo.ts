import { make_schema } from "../utils/schema";
import { IUIImgInfo } from "./IUIImgInfo.dat";

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
});
