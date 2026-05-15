import { Collision } from "../base";
import { StateEnum, ItrEffect, Defines } from "../defines";

/**
 * 判断护甲是否生效
 * @param collision
 * @returns
 */
export function is_armor_work(collision: Collision): boolean {
  const { victim } = collision;
  const { armor } = victim;

  /* 无护甲 */
  if (!armor)
    return false;

  /* 受击帧护甲无效 */
  const { bframe } = collision;
  if (bframe.state === StateEnum.Caught ||
    bframe.state === StateEnum.Injured ||
    bframe.state === StateEnum.Falling ||
    bframe.state === StateEnum.Frozen ||
    bframe.state === StateEnum.Lying ||
    bframe.state === StateEnum.Tired ||
    bframe.state === StateEnum.BrokenDefend ||
    bframe.state === StateEnum.Burning) {
    return false;
  }

  /* 非全时护甲时，站立、行走、奔跑、跳跃、跑跳以外的帧无效 */
  if (armor?.fulltime === false && (
    StateEnum.Standing !== bframe.state &&
    StateEnum.Walking !== bframe.state &&
    StateEnum.Running !== bframe.state &&
    StateEnum.Jump !== bframe.state &&
    StateEnum.Dash !== bframe.state
  )) {
    return false;
  }
  const { itr } = collision;
  const { effect } = itr;

  /* 判断是否防火 */
  if (!armor.fireproof && (
    effect === ItrEffect.Fire ||
    effect === ItrEffect.MFire1 ||
    effect === ItrEffect.MFire2 ||
    effect === ItrEffect.FireExplosion
  )) return false;

  /* 判断是否防冰 */
  if (!armor.antifreeze && (
    effect === ItrEffect.Ice2 ||
    effect === ItrEffect.Ice
  )) return false;

  /* 判断是否强制破防 */
  const { bdefend = 0 } = itr;
  if (bdefend >= Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE) return false;

  const { aframe } = collision;
  if (aframe.state === StateEnum.Ball_3006) return false;

  return true;
}
