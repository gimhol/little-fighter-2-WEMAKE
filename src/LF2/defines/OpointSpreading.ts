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
  Bat = 1,
  FirzenDisater = 2,
  JanDevilJudgement = 3,
  AngelBlessing = 4,
}
