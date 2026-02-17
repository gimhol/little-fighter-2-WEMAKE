
import { FrameBehavior, GK, type IFrameInfo } from "../defines";
import { is_ball } from "../entity";
import type { Entity } from "../entity/Entity";
import { BaseController } from "./BaseController";
import { type ControllerUpdateResult } from "./ControllerUpdateResult";
const { L, R, U, D, j, d } = GK
export class BallController extends BaseController {
  readonly __is_ball_ctrl__ = true;
  private _chasing: Entity | undefined = void 0;

  override update(): ControllerUpdateResult {
    const { chasing, facing, hp, frame } = this.entity;
    this.update_chasing();
    return super.update();
  }
  update_chasing() {
    const p2 = this.chase_pos;
    const vx = this.entity.velocity.x;
    const { chasing, facing, frame: { chase } } = this.entity;
    if (chase) {
      if (p2) {
        const p1 = this.entity.position;
        this.entity.merge_velocities();
        if (p2.x < p1.x) this.key_down(L).key_up(R)
        else if (p2.x > p1.x) this.key_down(R).key_up(L)
        else this.key_up(L, R)
        if (p2.z < p1.z) this.key_down(U).key_up(D)
        else if (p2.z > p1.z) this.key_down(D).key_up(U)
        else this.key_up(U, D)
        if (p1.y > p2.y) this.key_down(d).key_up(j)
        else if (p1.y < p2.y) this.key_down(j).key_up(d)
        else this.key_up(j, d)
      }
      if (is_ball(this.entity))
        this.entity.facing = vx > 0 ? 1 : -1;
    }
  }
  private lost_chasing(frame: IFrameInfo, facing: number) {
    if (frame.behavior === FrameBehavior.JohnBiscuitLeaving) {
      const p1 = this.entity.position;
      this.key_down(facing === -1 ? L : R);
      this.key_up(facing === -1 ? R : L, U, D);
      if (p1.y > 40) this.key_down(d).key_up(j);
      else if (p1.y < 40) this.key_down(j).key_up(d);
      else this.key_up(j, d);
    } else {
      const p1 = this.entity.position;
      this.key_down(facing === -1 ? L : R);
      this.key_up(facing === -1 ? R : L, U, D);
      if (p1.y > 40) this.key_down(d).key_up(j);
      else if (p1.y < 40) this.key_down(j).key_up(d);
      else this.key_up(j, d);
    }
  }
}