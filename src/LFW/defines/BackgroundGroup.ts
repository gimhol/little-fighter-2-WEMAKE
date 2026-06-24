export enum BackgroundGroup {
  /**
   * 常规
   * 属于此组才可被随机到
   */
  Regular = "regular",
  Hidden = "hidden"
}
export const BackgroundGroupDescriptions: Record<BackgroundGroup, string> = {
  [BackgroundGroup.Regular]: "",
  [BackgroundGroup.Hidden]: "",
}
export const BGG = BackgroundGroup;
export type BGG = BackgroundGroup;