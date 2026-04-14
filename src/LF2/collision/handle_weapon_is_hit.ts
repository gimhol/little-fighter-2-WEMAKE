import { ICollision } from "../base";
import { BuiltIn_OID, Defines, W_T } from "../defines";
import { calc_itr_velocity } from "./calc_itr_velocity";
import { handle_injury } from "./handle_injury";
import { handle_rest } from "./handle_rest";
import { handle_stiffness } from "./handle_stiffness";

export function handle_weapon_is_hit(collision: ICollision): void {
  handle_rest(collision)
  handle_stiffness(collision)
  handle_injury(collision)
  const { itr, attacker, victim, a_cube, b_cube } = collision;

  if (itr.bdefend && itr.bdefend >= Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE) {
    victim.hp = victim.hp_r = 0;
  }

  const is_fly = itr.fall && itr.fall >= Defines.DEFAULT_FALL_VALUE_CRITICAL;
  const spark_frame_name = is_fly ? "silent_critical_hit" : "silent_hit";
  victim.world.spark(...collision.victim.spark_point(a_cube, b_cube), spark_frame_name);

  let [vx, vy, vz] = calc_itr_velocity(collision)
  const is_base_ball =
    victim.base_type === W_T.Baseball ||
    victim.base_type === W_T.Drink;
  if (victim.base_type !== W_T.Heavy || is_fly) {
    victim.set_velocity(vx, vy, vz)
    victim.team = attacker.team;
    victim.lf2.mt.mark = 'hwih_1'
    let nid: string | undefined = void 0
    if (is_base_ball && (vx >= 6 || vx <= -6))
      nid = victim.lf2.mt.pick(victim.data.indexes?.throwings)
    else
      nid = victim.lf2.mt.pick(victim.data.indexes?.in_the_skys)
    victim.next_frame = { id: nid };
  }

  if (
    attacker.data.id === BuiltIn_OID.Weapon_Stick &&
    is_base_ball
  ) {
    const s = attacker.strength
    vx = attacker.facing * s * 10 // super fast!
    victim.lf2.mt.mark = 'hwih_2'
    victim.next_frame = { id: victim.data.indexes?.throwings?.[0] }
    victim.set_velocity(vx)
  }

}
