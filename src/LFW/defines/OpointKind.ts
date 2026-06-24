export enum OpointKind {
  /**
   * 发射！
   */
  Normal = 1,

  /**
   * 生成后拿在手上
   */
  Pick = 2,
}
export const OpointKindDescriptions: Record<OpointKind, string> = {
  [OpointKind.Normal]: "",
  [OpointKind.Pick]: "",
}
