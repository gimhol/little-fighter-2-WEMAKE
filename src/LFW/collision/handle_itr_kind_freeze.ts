import type { Collision } from "./Collision";
import { Defines, WeaponEnum } from "../defines";
import { calc_itr_velocity } from "./calc_itr_velocity";
import { handle_injury } from "./handle_injury";
import { handle_rest } from "./handle_rest";
import { handle_stiffness } from "./handle_stiffness";

export function handle_itr_kind_freeze(collision: Collision) {
  const { itr, victim, attacker } = collision;
  victim.play_sound(["data/065.wav.mp3"]);
  victim.fall_value -= attacker.itr_fall(itr)
  // const [vx, vy, vz] = calc_itr_velocity(collision)
  // victim.set_velocity(vx, vy, vz)
  if (victim.holding?.base_type === WeaponEnum.Heavy)
    victim.drop_holding()
  handle_injury(collision);
  handle_rest(collision);
  handle_stiffness(collision)
  victim.enter_frame_by_id(victim.data.indexes?.ice);
}

export function handle_itr_effect_freeze(collision: Collision) {
  const { itr, victim, attacker } = collision;
  victim.play_sound(["data/065.wav.mp3"]);
  victim.fall_value -= attacker.itr_fall(itr)
  const [vx, vy, vz] = calc_itr_velocity(collision)
  victim.set_velocity(vx, vy, vz)
  if (victim.holding?.base_type === WeaponEnum.Heavy)
    victim.drop_holding()
  handle_injury(collision);
  handle_rest(collision);
  handle_stiffness(collision)
  victim.enter_frame_by_id(victim.data.indexes?.ice);
}
