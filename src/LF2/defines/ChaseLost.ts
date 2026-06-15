export enum ChaseLost {
  /** 原地徘徊 */
  Hover         /**/ = 0b00000001,
  /** 离开 */
  Leave         /**/ = 0b00000010,
  /** TODO: 放弃寻找(未实现) */
  End           /**/ = 0b00000100,
}

export const ALL_CHASE_LOST: ChaseLost[] = [
  ChaseLost.Hover,
  ChaseLost.Leave,
  ChaseLost.End,
];

export const CHASE_LOST_LABEL_MAP: Record<ChaseLost, string> = {
  [ChaseLost.Hover]: "Hover",
  [ChaseLost.Leave]: "Leave",
  [ChaseLost.End]: "End",
};

export const CHASE_LOST_DESC_MAP: Record<ChaseLost, string> = {
  [ChaseLost.Hover]: "原地徘徊",
  [ChaseLost.Leave]: "离开",
  [ChaseLost.End]: "放弃寻找(未实现)",
};

