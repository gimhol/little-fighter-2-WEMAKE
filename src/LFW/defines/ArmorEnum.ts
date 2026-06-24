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
  [ArmorEnum.Defend]: "护甲耐久将会根据itr的bdefend扣除",
  [ArmorEnum.Fall]: "护甲耐久将会根据itr的fall扣除",
  [ArmorEnum.Times]: "护甲耐久将会根据攻击次数扣除",
  [ArmorEnum.Injury]: "护甲耐久将会根据itr的伤害值扣除",
}
export const ArmorEnumDescriptions: Record<ArmorEnum, string> = {
  [ArmorEnum.Defend]: "",
  [ArmorEnum.Fall]: "",
  [ArmorEnum.Times]: "",
  [ArmorEnum.Injury]: "",
}