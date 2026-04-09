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
