export enum ArmorEnum {
  Defend = 1,
  Fall = 2,
  Times = 3,
  Injury = 4
}
export const ALL_ARMOR_ENUM: ArmorEnum[] = [
  ArmorEnum.Defend,
  ArmorEnum.Fall,
  ArmorEnum.Times,
  ArmorEnum.Injury,
]
export const ARMOR_ENUM_LABEL_MAP: Record<ArmorEnum, string> = {
  [ArmorEnum.Defend]: "Defend",
  [ArmorEnum.Fall]: "Fall",
  [ArmorEnum.Times]: "Times",
  [ArmorEnum.Injury]: "Injury",
}

export const ARMOR_ENUM_DESC_MAP: Record<ArmorEnum, string> = {
  [ArmorEnum.Defend]: "Defend",
  [ArmorEnum.Fall]: "Fall",
  [ArmorEnum.Times]: "Times",
  [ArmorEnum.Injury]: "Injury",
}