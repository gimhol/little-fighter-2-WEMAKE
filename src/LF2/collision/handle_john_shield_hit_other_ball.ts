import { Collision } from "../base";
import { FrameBehavior } from "../defines";
import { handle_injury } from "./handle_injury";
import { handle_rest } from "./handle_rest";
import { handle_stiffness } from "./handle_stiffness";


export function handle_john_shield_hit_other_ball(collision: Collision): void {
  handle_rest(collision);
  handle_injury(collision);
  handle_stiffness(collision);
  const { attacker } = collision;
  attacker.shaking = attacker.motionless;
  attacker.play_sound(attacker.data.base.hit_sounds);
}
