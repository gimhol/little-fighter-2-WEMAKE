import { ICollision } from "../base";
import { ArmorEnum, Defines, SparkEnum } from "../defines";
import { round } from "../utils";
import { handle_injury } from "./handle_injury";
import { handle_rest } from "./handle_rest";
import { is_armor_work } from "./is_armor_work";
/**
 * 护甲逻辑
 *
 * @export
 * @param {ICollision} collision 碰撞信息
 * @return {boolean} 护甲是否有效
 */
export function handle_armor(collision: ICollision): boolean {
  const { victim, attacker } = collision;
  const { armor } = victim;

  /* 无护甲 或 护甲耐久为0 */
  if (!armor || !is_armor_work(collision))
    return false;

  const { itr, a_cube, b_cube } = collision;
  /* 判断是否强制破防 */
  const { bdefend = 0 } = itr;
  const {
    type,
    hit_sounds,
    injury_ratio = Defines.DEFAULT_ARMOR_INJURY_RATIO,
    motionless_ratio = Defines.DEFAULT_ARMOR_MOTIONLESS_RATIO,
    shaking_ratio = Defines.DEFAULT_ARMOR_SHAKING_RATIO,
    dead_sounds = hit_sounds
  } = armor;
  const { fall = Defines.DEFAULT_ITR_FALL, injury = 0 } = itr;
  let decrease_value = 0;
  switch (type) {
    case ArmorEnum.Fall: decrease_value = fall; break;
    case ArmorEnum.Defend: decrease_value = bdefend; break;
    case ArmorEnum.Times: decrease_value = 1; break;
    case ArmorEnum.Injury: decrease_value = injury; break;
  }
  victim.toughness -= decrease_value;
  const [x, y, z] = victim.spark_point(a_cube, b_cube);
  const spark_type = fall >= Defines.DEFAULT_FALL_VALUE_CRITICAL ?
    SparkEnum.SlientCriticalHit :
    SparkEnum.SlientHit;
  victim.world.spark(x, y, z, spark_type);
  const sounds = victim.toughness > 0 ? hit_sounds : dead_sounds;
  if (sounds) for (const s of sounds) victim.lf2.sounds.play(s, x, y, z);
  const {
    shaking = victim.world.itr_shaking,
    motionless = victim.world.itr_motionless
  } = itr
  attacker.motionless = round(motionless_ratio * motionless);
  victim.shaking = round(shaking_ratio * shaking);
  victim.set_velocity(0, 0, 0)
  handle_rest(collision)
  handle_injury(collision, injury_ratio)
  return true;
}
