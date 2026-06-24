export enum EntityGroup {
  /**
   * 隐藏角色
   */
  Hidden = "hidden",

  /**
   * BOSS
   */
  Boss = "Boss",

  /**
   * 比较大只的角色
   */
  Gaint = "Giant",

  /**
   * 常规角色
   * 属于此组的角色才可被随机到
   */
  Regular = "1000",

  /**
   * 最杂的杂鱼
   * 默认只有30和31的角色
   */
  _3000 = "3000",

  /**
   * 对战模式常规武器
   * 对战模式应当掉落属于这组的武器
   */
  VsWeapon = "VsWeapon",

  /**
   * 闯关常规武器
   * 闯关模式应当掉落属于这组的武器
   */
  StageWeapon = "StageWeapon",

  /**
   * 可被反弹为冰ball的ball
   */
  FreezableBall = "FreezableBall",

  /**
   * 可转化FreezableBall的对象
   */
  Freezer = "Freezer",

  /**
   * 
   */
  Dev = "Dev",
}

export const E_G = EntityGroup;
export type E_G = EntityGroup;
export const EG = EntityGroup;
export type EG = EntityGroup;

export const ALL_ENTITY_GROUP: EG[] = [
  EntityGroup.Hidden,
  EntityGroup.Boss,
  EntityGroup.Gaint,
  EntityGroup.Regular,
  EntityGroup._3000,
  EntityGroup.VsWeapon,
  EntityGroup.StageWeapon,
  EntityGroup.FreezableBall,
  EntityGroup.Freezer,
  EntityGroup.Dev,
];

export const ENTITY_GROUP_LABEL_MAP: Record<EG, string> = {
  [EntityGroup.Hidden]: "Hidden",
  [EntityGroup.Boss]: "Boss",
  [EntityGroup.Gaint]: "Gaint",
  [EntityGroup.Regular]: "Regular",
  [EntityGroup._3000]: "_3000",
  [EntityGroup.VsWeapon]: "VsWeapon",
  [EntityGroup.StageWeapon]: "StageWeapon",
  [EntityGroup.FreezableBall]: "FreezableBall",
  [EntityGroup.Freezer]: "Freezer",
  [EntityGroup.Dev]: "Dev",
}
export const ENTITY_GROUP_DESC_MAP: Record<EG, string> = {
  [EntityGroup.Hidden]: "Hidden",
  [EntityGroup.Boss]: "Boss",
  [EntityGroup.Gaint]: "Gaint",
  [EntityGroup.Regular]: "Regular",
  [EntityGroup._3000]: "_3000",
  [EntityGroup.VsWeapon]: "VsWeapon",
  [EntityGroup.StageWeapon]: "StageWeapon",
  [EntityGroup.FreezableBall]: "FreezableBall",
  [EntityGroup.Freezer]: "Freezer",
  [EntityGroup.Dev]: "Dev",
}
export const EntityGroupDescriptions: Record<EntityGroup, string> = {
  [EntityGroup.Hidden]: "",
  [EntityGroup.Boss]: "",
  [EntityGroup.Gaint]: "",
  [EntityGroup.Regular]: "",
  [EntityGroup._3000]: "",
  [EntityGroup.VsWeapon]: "",
  [EntityGroup.StageWeapon]: "",
  [EntityGroup.FreezableBall]: "",
  [EntityGroup.Freezer]: "",
  [EntityGroup.Dev]: "",
}