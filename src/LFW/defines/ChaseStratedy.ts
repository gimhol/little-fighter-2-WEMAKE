
export enum ChaseStratedy {
  /** 总是跟踪最近的目标 */
  Default = 0,
  /**
   * 在当前跟踪目标丢失前，不会更改跟踪目标
   */
  TillLost = 1,
}

export const ALL_CHASE_STRATEDY: ChaseStratedy[] = [
  ChaseStratedy.Default,
  ChaseStratedy.TillLost,
];

export const CHASE_STRATEDY_LABEL_MAP: Record<ChaseStratedy, string> = {
  [ChaseStratedy.Default]: "Default",
  [ChaseStratedy.TillLost]: "TillLost",
};

export const CHASE_STRATEDY_DESC_MAP: Record<ChaseStratedy, string> = {
  [ChaseStratedy.Default]: "总是跟踪最近的目标",
  [ChaseStratedy.TillLost]: "在当前跟踪目标丢失前，不会更改跟踪目标",
};
export const ChaseStratedyDescriptions: Record<ChaseStratedy, string> = {
  [ChaseStratedy.Default]: "",
  [ChaseStratedy.TillLost]: "",
}
