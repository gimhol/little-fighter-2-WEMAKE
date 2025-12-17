import { ICollision } from "../base";
import { Defines, ItrEffect, ItrKind, SparkEnum, StateEnum, TFace } from "../defines";
import { is_character, same_face, turn_face } from "../entity";
import { handle_fall } from "./handle_fall";
import { handle_injury } from "./handle_injury";
import { handle_itr_kind_freeze } from "./handle_itr_kind_freeze";
import { handle_rest } from "./handle_rest";
import { handle_stiffness } from "./handle_stiffness";
import { handle_armor } from "./handle_armor";

export function handle_itr_normal_bdy_normal(collision: ICollision) {
  const { itr, attacker, victim, a_cube, b_cube } = collision;
  if (itr.effect == ItrEffect.Ignore) return;
  if (handle_armor(collision)) return;
  switch (itr.effect) {
    case ItrEffect.Fire:
    case ItrEffect.MFire1:
    case ItrEffect.MFire2:
    case ItrEffect.FireExplosion: {
      handle_injury(collision);
      handle_rest(collision)
      handle_stiffness(collision)
      handle_fall(collision);
      break;
    }
    case ItrEffect.Ice2:
      handle_itr_kind_freeze(collision)
      break;
    case ItrEffect.Ice: {
      if (victim.frame.state === StateEnum.Frozen) {
        handle_injury(collision);
        handle_stiffness(collision)
        handle_rest(collision)
        handle_fall(collision);
      } else {
        handle_itr_kind_freeze(collision)
      }
      break;
    }
    case ItrEffect.Explosion:
    case ItrEffect.Normal:
    case ItrEffect.Sharp:
    case void 0: {
      handle_injury(collision);
      handle_rest(collision)
      handle_stiffness(collision)
      const { fall = Defines.DEFAULT_ITR_FALL } = itr;
      victim.fall_value -= fall;
      victim.defend_value = 0;
      const is_fall =
        victim.fall_value <= 0 ||
        victim.hp <= 0 ||
        victim.frame.state === StateEnum.Frozen ||
        (victim.fall_value <= Defines.DEFAULT_FALL_VALUE_DIZZY &&
          (StateEnum.Caught === victim.frame.state ||
            victim.velocity_0.y > 0 ||
            victim.position.y > victim.ground_y));
      if (is_fall) {
        handle_fall(collision);
      } else {
        if (itr.dvx) victim.velocity_0.x = itr.dvx * attacker.facing;
        if (victim.position.y > victim.ground_y && victim.velocity_0.y > 2)
          victim.velocity_0.y = 2;
        victim.velocity_0.z = 0;

        const [x, y, z] = victim.spark_point(a_cube, b_cube)
        if (itr.effect === ItrEffect.Sharp && is_character(victim)) {
          victim.world.spark(x, y, z, SparkEnum.Bleed);
        } else {
          victim.world.spark(x, y, z, SparkEnum.Hit);
        }
        if (StateEnum.Caught === victim.frame.state) {
          if (victim.frame.cpoint) {
            const { backhurtact, fronthurtact } = victim.frame.cpoint;
            if (attacker.facing === victim.facing && backhurtact) {
              victim.next_frame = { id: backhurtact };
            } else if (attacker.facing !== victim.facing && fronthurtact) {
              victim.next_frame = { id: fronthurtact };
            }
          }
        } else {
          /* 击晕 */
          if (victim.fall_value <= Defines.DEFAULT_FALL_VALUE_DIZZY) {
            victim.next_frame = { id: victim.data.indexes?.dizzy };
          } else if (victim.data.indexes?.grand_injured) {
            /* 击中 */
            victim.next_frame = {
              id: victim.data.indexes.grand_injured[same_face(victim, attacker)][0],
            };
          }
        }
      }
      break;
    }
  }
}

