import type { IBdyInfo } from "./IBdyInfo";
import type { IItrInfo } from "./IItrInfo";
export type __KEEP_IBdyInfo = IBdyInfo;
export type __KEEP_IItrInfo = IItrInfo;
/**
 * @link https://www.lf-empire.de/en/lf2-empire/data-changing/reference-pages/181-effects
 */
export enum ItrEffect {
  /**
   * 普通效果
   * 
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   * 
   */
  Normal = 0,

  /**
   * 利器，攻击效果是血花
   * 
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   */
  Sharp = 1,

  /**
   * 着火
   * 
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   */
  Fire = 2,

  /**
   * 结冰
   *
   * 使不被冰封的人被冰封。被冰封（state：13）的人碎冰。
   */
  Ice = 3,

  /**
   * 穿过敌人(仅能打中type 1.2.3.4.5.6的物件)
   */
  Through = 4,

  /**
   * 没效果，也打不中任何东西
   */
  None = 5,

  /**
   * 火焰攻击_1
   *
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * - 原版中：
   *    - 能攻击队友（着火的人烧到队友就是用此实现的）
   *
   * - WEMAKE中：
   *    - 能不能攻击队友是通过itr.hit_flag于bdy.hit_flag决定的。
   *
   * @see {IItrInfo.hit_flag}
   * @see {IBdyInfo.hit_flag}
   */
  MFire1 = 20,

  /** 定身火 ?? */
  MFire2 = 21,

  /**
   * 爆炸类的攻击(带火焰效果)
   *
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * 攻击方向将根据攻受两方的X轴位置决定（攻击方向决定了击飞速度的方向），
   * 以此实现左边被打的往左飞，右边被打的往右飞的效果。
   * 被击中的角色将着火。
   *
   * 例: firen d^j
   */
  FireExplosion = 22,

  /**
   * 爆炸类的攻击
   *
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * 攻击方向将根据攻受两方的X轴位置决定（攻击方向决定了击飞速度的方向），
   * 以此实现左边被打的往左飞，右边被打的往右飞的效果。
   *
   * 例: julian d^j
   */
  Explosion = 23,

  /**
   * 结冰
   *
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * - 原版：
   *   - 使不被冰封的人被冰封。无法攻击，被冰封（state：13）的人。
   */
  Ice2 = 30,

  Ignore = 10000,
}


export const itr_effect_name = (v: any) => ItrEffect[v] ?? `unknown_${v}`;
export const itr_effect_full_name = (v: any) => `ItrEffect.${itr_effect_name(v)}`
export const itr_effect_desc = (v: any) => ItrEffectDescriptions[v as ItrEffect] || itr_effect_full_name(v)
export const ItrEffectDescriptions: Record<ItrEffect, string> = {
  [ItrEffect.Normal]: "",
  [ItrEffect.Sharp]: "",
  [ItrEffect.Fire]: "",
  [ItrEffect.Ice]: "",
  [ItrEffect.Through]: "",
  [ItrEffect.None]: "",
  [ItrEffect.MFire1]: "",
  [ItrEffect.MFire2]: "",
  [ItrEffect.FireExplosion]: "",
  [ItrEffect.Explosion]: "",
  [ItrEffect.Ice2]: "",
  [ItrEffect.Ignore]: ""
}
const descs: any = ItrEffectDescriptions;
for (const key in descs) {
  descs[key] = descs[key] || itr_effect_full_name(key)
}
