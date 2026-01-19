import { ICollision } from "../base";
import { BdyKind, Defines, FrameBehavior } from "../defines";
import { is_fighter } from "../entity";
import { handle_rest } from "./handle_rest";
import { handle_stiffness } from "./handle_stiffness";

export function handle_ball_hit_other(collision: ICollision): void {
  handle_rest(collision);
  handle_stiffness(collision);
  const { attacker, aframe, victim, bdy, itr } = collision;
  switch (aframe.behavior as FrameBehavior) {
    case FrameBehavior.JohnChase: {
      if (!is_fighter(victim)) break
      const { bdefend } = itr;
      if (bdy.kind === BdyKind.Normal) {
        attacker.hp = attacker.hp_r = 0;
      } else if (bdy.kind === BdyKind.Defend) {
        if (bdefend && bdefend >= Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE) {
          attacker.hp = attacker.hp_r = 0;
        } else if (victim.facing === attacker.facing) {
          attacker.hp = attacker.hp_r = 0;
        }
      }
      break;
    }
    case FrameBehavior.DennisChase:
    case FrameBehavior.Boomerang:
    case FrameBehavior.AngelBlessing:
    case FrameBehavior.AngelBlessingStart:
    case FrameBehavior.DevilJudgementStart:
    case FrameBehavior.ChasingSameEnemy:
    case FrameBehavior.BatStart:
    case FrameBehavior.FirzenDisasterStart:
    case FrameBehavior.JohnBiscuitLeaving:
    case FrameBehavior.FirzenVolcanoStart:
    case FrameBehavior.Bat:
    case FrameBehavior.JulianBallStart:
    case FrameBehavior.JulianBall:
      break;
  }
  attacker.play_sound(attacker.data.base.hit_sounds)
}
