import { FrameBehavior, GK, IFrameInfo, IVector3 } from "../defines";
import { BaseController } from "./BaseController";
import { ControllerUpdateResult } from "./ControllerUpdateResult";
const { L, R, U, D, j, d } = GK
export class BallController extends BaseController {
  readonly __is_ball_ctrl__ = true;
  public target_position: IVector3 | null = null
  override update(): ControllerUpdateResult {
    if (this.entity.chasing) {
      this.target_position = this.entity.chasing.position.clone();
      const cy = this.entity.frame.chasing_y ?? 0.5;
      this.target_position.y += this.entity.chasing.frame.centery * cy
    }
    const { facing, hp, frame } = this.entity

    if (this.target_position) {
      if (hp > 0) {
        const p1 = this.entity.position;
        const p2 = this.target_position;
        const vx = this.entity.velocity.x;
        this.entity.merge_velocities();
        if (p2.x < p1.x) this.press(L).release(R)
        else if (p2.x > p1.x) this.press(R).release(L)
        else this.release(L, R)

        if (p2.z < p1.z) this.press(U).release(D)
        else if (p2.z > p1.z) this.press(D).release(U)
        else this.release(U, D)

        if (p1.y > p2.y) this.press(d).release(j)
        else if (p1.y < p2.y) this.press(j).release(d)
        else this.release(j, d)

        if (vx > 0 && facing < 0) this.entity.facing = 1
        else if (vx < 0 && facing > 0) this.entity.facing = -1

      } else this.target_lost(frame, facing);
    } else this.target_lost(frame, facing);
    return super.update();
  }

  private target_lost(frame: IFrameInfo, facing: number) {
    if (frame.behavior === FrameBehavior.JohnBiscuitLeaving) {
      const p1 = this.entity.position;
      this.press(facing === -1 ? L : R);
      this.release(facing === -1 ? R : L, U, D);
      if (p1.y > 40) this.press(d).release(j);
      else if (p1.y < 40) this.press(j).release(d);
      else this.release(j, d);
    } else {
      const p1 = this.entity.position;
      this.press(facing === -1 ? L : R);
      this.release(facing === -1 ? R : L, U, D);
      if (p1.y > 40) this.press(d).release(j);
      else if (p1.y < 40) this.press(j).release(d);
      else this.release(j, d);
    }
  }
}