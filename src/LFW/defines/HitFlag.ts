
/**
 * 队伍判定flag
 */
export enum HitFlag {
  Enemy        /**/ = 0b00000001,
  Ally         /**/ = 0b00000010,
  Ohters       /**/ = 0b00000100,
  Fighter      /**/ = 0b00001000,
  Weapon       /**/ = 0b00010000,
  Ball         /**/ = 0b00100000,
  Dead         /**/ = 0b10000000,
  Both         /**/ = HitFlag.Ally | HitFlag.Enemy,
  AllType      /**/ = HitFlag.Ohters | HitFlag.Fighter | HitFlag.Weapon | HitFlag.Ball,
  AllEnemy     /**/ = HitFlag.AllType | HitFlag.Enemy,
  AllAlly      /**/ = HitFlag.AllType | HitFlag.Ally,
  AllBoth      /**/ = HitFlag.AllType | HitFlag.Both,
  EnemyFighter /**/ = HitFlag.Enemy | HitFlag.Fighter,
  EnemyWeapon  /**/ = HitFlag.Enemy | HitFlag.Weapon,
  EnemyBall    /**/ = HitFlag.Enemy | HitFlag.Ball,
  AllyFighter  /**/ = HitFlag.Ally | HitFlag.Fighter,
  AllyWeapon   /**/ = HitFlag.Ally | HitFlag.Weapon,
  AllyBall     /**/ = HitFlag.Ally | HitFlag.Ball,
}

export const get_hit_flag_name = (v: any) => {
  const num = Number(v)
  const name = (HIT_FLAG_NAME_MAP as any)[num as HitFlag];
  if (name) return name;
  const ret = [
    HitFlag.Enemy, HitFlag.Ally, HitFlag.Ohters, HitFlag.Fighter,
    HitFlag.Weapon, HitFlag.Ball, HitFlag.Dead
  ].filter(r => {
    return r & v
  }).map(r => {
    return HIT_FLAG_NAME_MAP[r]
  }).join('|') || `unknown_${v}`;
  return (HIT_FLAG_NAME_MAP as any)[v] = ret;
}
export const get_hit_flag_full_name = (v: any) => `AllyFlag.${get_hit_flag_name(v)}`
export const get_hit_flag_desc = (v: any) => HIT_FLAG_DESC_MAP[v as HitFlag] || get_hit_flag_full_name(v)
export const HIT_FLAG_DESC_MAP: Record<HitFlag, string> = {
  [HitFlag.Both]: "判定队友与队友",
  [HitFlag.AllEnemy]: "判定全类型敌人",
  [HitFlag.AllAlly]: "判定全类型队友",
  [HitFlag.AllBoth]: "判定全类型敌人与队友",
  [HitFlag.Fighter]: "Fighter",
  [HitFlag.Weapon]: "Weapon",
  [HitFlag.Ball]: "Ball",
  [HitFlag.Ohters]: "Ohters",
  [HitFlag.AllType]: "全类型",
  [HitFlag.Enemy]: "敌人",
  [HitFlag.Ally]: "队友",
  [HitFlag.EnemyFighter]: "EnemyFighter",
  [HitFlag.EnemyWeapon]: "EnemyWeapon",
  [HitFlag.AllyFighter]: "AllyFighter",
  [HitFlag.AllyWeapon]: "AllyWeapon",
  [HitFlag.AllyBall]: "AllyBall",
  [HitFlag.Dead]: "Dead",
  [HitFlag.EnemyBall]: "EnemyBall"
}
export const HitFlagDescriptions: Record<HitFlag, string> = {
  [HitFlag.Enemy]: "",
  [HitFlag.Ally]: "",
  [HitFlag.Ohters]: "",
  [HitFlag.Fighter]: "",
  [HitFlag.Weapon]: "",
  [HitFlag.Ball]: "",
  [HitFlag.Dead]: "",
  [HitFlag.Both]: "",
  [HitFlag.AllType]: "",
  [HitFlag.AllEnemy]: "",
  [HitFlag.AllAlly]: "",
  [HitFlag.AllBoth]: "",
  [HitFlag.EnemyFighter]: "",
  [HitFlag.EnemyWeapon]: "",
  [HitFlag.EnemyBall]: "",
  [HitFlag.AllyFighter]: "",
  [HitFlag.AllyWeapon]: "",
  [HitFlag.AllyBall]: "",
}
export const HIT_FLAG_NAME_MAP: Record<HitFlag, string> = {
  [HitFlag.Enemy]: "Enemy",
  [HitFlag.Ally]: "Ally",
  [HitFlag.Ohters]: "Ohters",
  [HitFlag.Fighter]: "Fighter",
  [HitFlag.Weapon]: "Weapon",
  [HitFlag.Ball]: "Ball",
  [HitFlag.Dead]: "Dead",
  [HitFlag.Both]: "Both",
  [HitFlag.AllType]: "AllType",
  [HitFlag.AllEnemy]: "AllEnemy",
  [HitFlag.AllAlly]: "AllAlly",
  [HitFlag.AllBoth]: "AllBoth",
  [HitFlag.EnemyFighter]: "EnemyFighter",
  [HitFlag.EnemyWeapon]: "EnemyWeapon",
  [HitFlag.AllyFighter]: "AllyFighter",
  [HitFlag.AllyWeapon]: "AllyWeapon",
  [HitFlag.AllyBall]: "AllyBall",
  [HitFlag.EnemyBall]: "EnemyBall"
}

export const ALL_HIT_FLAG: HitFlag[] = Object.keys(HIT_FLAG_NAME_MAP).map(Number) as HitFlag[];


