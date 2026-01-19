import { FrameBehavior, IFrameInfo, StateEnum } from "../defines";
import { Entity } from "../entity/Entity";
import { is_ball_ctrl } from "../entity/type_check";
import State_Base from "./State_Base";

export default class BallState_Base extends State_Base {
  override on_frame_changed(e: Entity, frame: IFrameInfo, prev_frame: IFrameInfo): void {
    if (prev_frame.behavior !== frame.behavior) {
      const ctrl = is_ball_ctrl(e.ctrl) ? e.ctrl : null
      switch (prev_frame.behavior as FrameBehavior) {
        case FrameBehavior.JohnChase:
        case FrameBehavior.DennisChase:
        case FrameBehavior.Boomerang:
        case FrameBehavior.JulianBall:
          e.world.del_enemy_chaser(e);
          break;
      }
      switch (frame.behavior as FrameBehavior) {
        case FrameBehavior.JohnChase:
        case FrameBehavior.DennisChase:
        case FrameBehavior.Boomerang:
        case FrameBehavior.JulianBall:
          e.world.add_enemy_chaser(e);
          if (ctrl) ctrl.target_position.copy(ctrl.entity.position)
          break;
        case FrameBehavior.ChasingSameEnemy:
        case FrameBehavior.AngelBlessing:
          if (ctrl) ctrl.target_position.copy(ctrl.entity.position)
          break;
      }
    }
  }
  override enter(e: Entity, _prev_frame: IFrameInfo): void {
    switch (e.frame.state) {
      case StateEnum.Ball_Hitting:
      case StateEnum.Ball_Hit:
      case StateEnum.Ball_Rebounding:
      case StateEnum.Ball_Disappear:
        e.shaking = 0;
        e.motionless = 0;
        e.set_velocity(0, 0, 0)
        break;
    }
  }
}
