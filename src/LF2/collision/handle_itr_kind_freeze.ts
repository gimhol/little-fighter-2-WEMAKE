import { ICollision } from "../base/ICollision";
import { Defines } from "../defines";
import { calc_itr_velocity } from "./calc_itr_velocity";
import { handle_injury } from "./handle_injury";
import { handle_rest } from "./handle_rest";
import { handle_stiffness } from "./handle_stiffness";

export function handle_itr_kind_freeze(collision: ICollision) {
  const { itr, victim } = collision;
  victim.play_sound(["data/065.wav.mp3"]);
  victim.fall_value -= itr.fall ? itr.fall : Defines.DEFAULT_ITR_FALL;
  const [vx, vy, vz] = calc_itr_velocity(collision)
  victim.set_velocity(vx, vy, vz)
  victim.next_frame = { id: victim.data.indexes?.ice };
  handle_injury(collision);
  handle_rest(collision);
  handle_stiffness(collision)
}
