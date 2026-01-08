import { ICollision } from "../base";
import { BuiltIn_OID, Defines, W_T } from "../defines";
import { floor } from "../utils";
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
  const spark_frame_name = is_fly ? "slient_critical_hit" : "slient_hit";
  victim.world.spark(...collision.victim.spark_point(a_cube, b_cube), spark_frame_name);

  let weight_x = victim.data.base.weight || 1;
  let weight_y = victim.data.base.weight || 1;
  let vx = floor((itr.dvx ? itr.dvx * attacker.facing : 0) / weight_x);
  let vy = floor((itr.dvy ? itr.dvy : Defines.DEFAULT_IVY_D) / weight_y);


  if (victim.data.base.type !== W_T.Heavy || is_fly) {
    victim.set_velocity(vx, vy, 0)
    victim.team = attacker.team;
    victim.next_frame = { id: victim.lf2.random_get(victim.data.indexes?.in_the_skys) };
  }

  if (
    attacker.data.id === BuiltIn_OID.Weapon_Stick &&
    (
      victim.data.id === BuiltIn_OID.Weapon_baseball ||
      victim.data.id === BuiltIn_OID.Weapon_milk ||
      victim.data.id === BuiltIn_OID.Weapon_Beer
    )
  ) {
    const s = attacker.data.base.strength || 1
    vx = attacker.facing * s * 20
    victim.next_frame = { id: victim.lf2.random_get(victim.data.indexes?.throwings) }
  }

}
