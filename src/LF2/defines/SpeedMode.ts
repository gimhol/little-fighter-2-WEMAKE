export enum SpeedMode {
  /** 
   * 当 新旧速度方向一致 且 新速度大于当前速度，
   * 或 新旧速度方向不一致 时
   * 用新速度覆盖当前速度。
   */
  LF2 = 0,
  
  /** 
   * 跟随方向加速度 
   */
  Acc = 1,

  FixedLf2 = 2,
  
  /** 
   * 固定方向加速 
   */
  FixedAcc = 3,

  /** 
   * 加速直至到达指定速度
   * 
   */
  AccTo = 4,

  /**
   * 
   */
  Extra = 5,

  Fixed = 6,
}
