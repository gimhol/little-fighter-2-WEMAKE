import { CheatType } from "./CheatType";
export enum CMD {
  F1 = 'f1',
  F2 = 'f2',
  F4 = 'f4',
  F5 = 'f5',
  F6 = 'f6',
  F7 = 'f7',
  F8 = 'f8',
  F9 = 'f9',
  F10 = 'f10',
  LF2_NET = CheatType.LF2_NET,
  HERO_FT = CheatType.HERO_FT,
  GIM_INK = CheatType.GIM_INK
}
export const CMD_NAMES: Record<CMD, string> = {
  [CMD.F1]: "F1",
  [CMD.F2]: "F2",
  [CMD.F4]: "F4",
  [CMD.F5]: "F5",
  [CMD.F6]: "F6",
  [CMD.F7]: "F7",
  [CMD.F8]: "F8",
  [CMD.F9]: "F9",
  [CMD.F10]: "F10",
  [CMD.LF2_NET]: "LF2_NET",
  [CMD.HERO_FT]: "HERO_FT",
  [CMD.GIM_INK]: "GIM_INK"
}