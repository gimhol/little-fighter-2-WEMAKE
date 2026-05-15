
export enum ChaseStratedy {
  /** 总是跟踪最近的目标 */
  Default = 0,
  /** 
   * 在当前跟踪目标丢失前，不会更改跟踪目标 
   */
  TillLost = 1,
}
