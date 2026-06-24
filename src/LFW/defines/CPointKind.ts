export enum CPointKind {
  /**
   * 抓人的
   */
  Attacker = 1,

  /**
   * 被抓的
   */
  Victim = 2
}
export const CPointKindDescriptions: Record<CPointKind, string> = {
  [CPointKind.Attacker]: "",
  [CPointKind.Victim]: "",
}
