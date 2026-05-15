
export interface IPictureInfo {
  /**
   * 图片ID 
   */
  id: string;

  /** 
   * 图片路径 
   */
  path: string;

  /** 
   * 变体ID
   * 
   * 指向其他图片ID
   * 
   * 目前用于实现不同队伍不同颜色的角色 
   */
  variants?: string[];

  /** @deprecated LF2中的row，LFW不再使用，但LFW-TOOL转换的数据会保留此值 */
  row?: number;

  /** @deprecated LF2中的col，LFW不再使用，但LFW-TOOL转换的数据会保留此值 */
  col?: number;

  /** @deprecated LF2中的w，LFW不再使用，但LFW-TOOL转换的数据会保留此值 */
  cell_w?: number;

  /** @deprecated LF2中的h，LFW不再使用，但LFW-TOOL转换的数据会保留此值 */
  cell_h?: number;
}
