export interface IBgInfo {
  /** 背景名称 */
  name?: string;
  /** 阴影资源路径 */
  shadow?: string;
  /** 阴影宽度 */
  shadow_w?: number;
  /** 阴影高度 */
  shadow_h?: number;
  /** 所属组 */
  group?: string[]
  /** 左边界 */
  left?: number;
  /** 右边界 */
  right?: number;
  /** 远边界（负值，数值上更小） */
  far?: number;
  /** 近边界（负值，数值上更大）*/
  near?: number;
  /** 高度，默认 600 */
  height?: number;
  /** X 轴缩放 */
  zoom_x?: number;
  /** Y 轴缩放 */
  zoom_y?: number;
  /** Z 轴缩放 */
  zoom_z?: number;
}

export function bg_info_new(): IBgInfo {
  return {};
}