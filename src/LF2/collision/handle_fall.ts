
import { ICollision } from "../base/ICollision";
import { Defines, ItrEffect, SparkEnum, TFace } from "../defines";
import { turn_face } from "../entity";
import { is_fighter } from "../entity/type_check";
import { calc_itr_velocity } from "./calc_itr_velocity";

export function handle_fall(collision: ICollision) {
  const { itr, victim, a_cube, b_cube } = collision;
  victim.toughness = 0;
  victim.fall_value = 0;
  victim.defend_value = 0;
  victim.resting = 0;
  const [vx, vy, vz, facing] = calc_itr_velocity(collision)
  victim.set_velocity(vx, vy, vz)

  const is_critical = !!(itr.fall && itr.fall >= Defines.DEFAULT_FALL_VALUE_CRITICAL)

  const spark_pos = victim.spark_point(a_cube, b_cube);
  let effect = SparkEnum.Hit;
  if (itr.effect === ItrEffect.Sharp && is_fighter(victim)) {
    effect = is_critical ? SparkEnum.CriticalBleed : SparkEnum.BleedFall;
  } else {
    effect = is_critical ? SparkEnum.CriticalHit : SparkEnum.HitFall;
  }
  victim.world.spark(...spark_pos, effect)

  const { fire, critical_hit } = victim.data.indexes || {}

  const normal_fall_act = () => {
    if (!critical_hit) return;
    const direction: TFace = victim.velocity.x / victim.facing >= 0 ? 1 : -1;
    victim.enter_frame({ id: critical_hit[direction][0] });
  }

  switch (itr.effect) {
    case ItrEffect.Fire:
    case ItrEffect.MFire2:
      if (fire) {
        victim.enter_frame({
          id: fire[0],
          facing: turn_face(facing),
        });
      } else {
        normal_fall_act()
      }
      break;
    case ItrEffect.MFire1:
    case ItrEffect.FireExplosion:
      if (fire) {
        victim.enter_frame({
          id: fire[0],
          facing: facing,
        });
      } else {
        normal_fall_act()
      }
      break;
    default:
      normal_fall_act()
      break;
  }

}
