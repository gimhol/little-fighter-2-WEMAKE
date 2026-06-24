export enum CheatEnum {
  LF2_NET = "LF2_NET",
  HERO_FT = "HERO_FT",
  GIM_INK = "GIM_INK"
}
export const CheatTypeDescriptions: Record<CheatEnum, string> = {
  [CheatEnum.LF2_NET]: "",
  [CheatEnum.HERO_FT]: "",
  [CheatEnum.GIM_INK]: "",
}
export function is_cheat_type(v: any): v is CheatEnum {
  return v in CheatEnum
}