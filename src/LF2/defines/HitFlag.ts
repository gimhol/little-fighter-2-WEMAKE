
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
  EnemyBall    /**/ = HitFlag.Enemy | HitFlag.Weapon,
  AllyFighter  /**/ = HitFlag.Ally | HitFlag.Fighter,
  AllyWeapon   /**/ = HitFlag.Ally | HitFlag.Weapon,
  AllyBall     /**/ = HitFlag.Ally | HitFlag.Ball,
}
export const hit_flag_name = (v: any) => HitFlag[v] ?? `unknown_${v}`;
export const hit_flag_full_name = (v: any) => `AllyFlag.${hit_flag_name(v)}`
export const hit_flag_desc = (v: any) => hit_flag_desc_map[v as HitFlag] || hit_flag_full_name(v)
export const hit_flag_desc_map: Record<HitFlag, string> = {
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
  [HitFlag.Dead]: "Dead"
}
const descs: any = hit_flag_desc_map;
for (const key in descs) {
  descs[key] = descs[key] || hit_flag_full_name(key)
}
