
export enum ChaseStratedy {
  /** 跟踪最近的目标 */
  Default = 0,
  /** 在目标丢失前，将不会更改跟踪目标 */
  TillLost = 1,
}
