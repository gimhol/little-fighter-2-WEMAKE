export enum CheatType {
  LF2_NET = "LF2_NET",
  HERO_FT = "HERO_FT",
  GIM_INK = "GIM_INK"
}
export function is_cheat_type(v: any): v is CheatType {
  return v in CheatType
}