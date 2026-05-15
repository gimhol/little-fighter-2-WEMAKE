import { make_field_orders } from "./make_field_orders";

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
export const bg_layer_field_orders = make_field_orders<IBgLayerInfo>({
  id: 0,
  name: 0,
  file: 0,
  absolute: 0,
  color: 0,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  z: 0,
  w: 0,
  h: 0,
  loop: 0,
  cc: 0,
  c1: 0,
  c2: 0,
  offsetAnimX: 0,
  offsetAnimY: 0
})