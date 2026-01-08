import { ICollision } from "../base/ICollision";
import { Defines, StateEnum } from "../defines";
import { handle_injury } from "./handle_injury";
import { handle_rest } from "./handle_rest";
import { handle_stiffness } from "./handle_stiffness";

export function handle_itr_kind_freeze(collision: ICollision) {
  const { itr, victim, attacker } = collision;
  victim.play_sound(["data/065.wav.mp3"]);
  victim.fall_value -= itr.fall ? itr.fall : Defines.DEFAULT_ITR_FALL;
  let { x: vx, y: vy, z: vz } = victim.velocity;

  const is_fall =
    victim.fall_value <= 0 ||
    (victim.fall_value <= Defines.DEFAULT_FALL_VALUE_DIZZY &&
      (StateEnum.Caught === victim.frame.state ||
        vy > 0 ||
        victim.position.y > victim.ground_y));

  if (is_fall && itr.dvy) vy = (itr.dvy ?? attacker.world.ivy_d) * attacker.world.ivy_f;
  if (itr.dvz) vz = itr.dvz * attacker.world.ivz_f;
  vx = (itr.dvx ?? attacker.world.ivx_d) * attacker.facing * attacker.world.ivx_f;
  victim.set_velocity(vx, vy, vz)
  victim.next_frame = { id: victim.data.indexes?.ice };
  handle_injury(collision);
  handle_rest(collision);
  handle_stiffness(collision)
}
