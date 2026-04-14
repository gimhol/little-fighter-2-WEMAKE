/**
 * 物体产生时的扩散模式
 */
export enum OpointSpreading {
  /**
   * 跟LF2一样(大概)
   * 
   * Z轴速度计算: velocity.z = (index - (count - 1) / 2) * 2.5
   */
  Normal = 0,
  /**
   * 随机扩散
   * 
   * 扩散速度向量的xyz将从随机取。
   * spreading_x, spreading_z, spreading_y
   */
  Spreading = 1,

  FloatRange = 2,

  AngelBlessing = 4,
}
