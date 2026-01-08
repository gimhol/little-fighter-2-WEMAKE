import { ICollision } from "../base";
import { Builtin_FrameId, BuiltIn_OID, Defines, EntityGroup, ItrKind, SparkEnum, StateEnum } from "../defines";
import { Factory, turn_face } from "../entity";
import { handle_rest } from "./handle_rest";
import { handle_stiffness } from "./handle_stiffness";


export function handle_ball_is_hit(collision: ICollision): void {
  const { victim, attacker, itr, a_cube, b_cube, aframe } = collision;
  handle_rest(collision);
  handle_stiffness(collision);
  if (itr.bdefend && itr.bdefend >= Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE) {
    victim.hp = victim.hp_r = 0;
  }
  victim.set_velocity(0, 0, 0)
  switch (victim.frame.state) {
    case StateEnum.Ball_Flying:
    case StateEnum.Ball_Rebounding:
      victim.team = attacker.team;
      break;
  }
  victim.world.spark(...victim.spark_point(a_cube, b_cube),
    itr.fall && itr.fall > Defines.DEFAULT_FALL_VALUE_CRITICAL ?
      SparkEnum.CriticalHit :
      SparkEnum.Hit
  );
  victim.play_sound(victim.data.base.hit_sounds)
}