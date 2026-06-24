import { any, fields, flt, int, str } from "../fields";

export interface IBgLayerInfo {
  /** 预留的 */
  id?: string;
  /** 预留的 */
  name?: string;

  file?: string;
  absolute?: number;
  color?: number | string;
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  /** 
   * x轴循环布置间隔距离
   */
  loop?: number;
  cc?: number;
  c1?: number;
  c2?: number;

  /** UV偏移动画，横轴(像素/秒) */
  offsetAnimX?: number;
  /** UV偏移动画，纵轴(像素/秒) */
  offsetAnimY?: number;
}
export const bg_layer_info_fields = fields<IBgLayerInfo>({
  id: str("预留ID"),
  name: str("预留名称"),
  file: str("文件"),
  absolute: int("绝对"),
  color: any,
  width: int("宽度"),
  height: int("高度"),
  x: int("X"),
  y: int("Y"),
  z: int("Z"),
  w: int("W"),
  h: int("H"),
  loop: int("循环间隔"),
  cc: int("CC"),
  c1: int("C1"),
  c2: int("C2"),
  offsetAnimX: flt("UV动画X"),
  offsetAnimY: flt("UV动画Y"),
})