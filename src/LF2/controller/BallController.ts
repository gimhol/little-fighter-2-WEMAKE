import { FrameBehavior, GK, IFrameInfo, IVector3 } from "../defines";
import { Ditto } from "../ditto";
import { round_float } from "../utils";
import { BaseController } from "./BaseController";
import { ControllerUpdateResult } from "./ControllerUpdateResult";
const { L, R, U, D, j, d } = GK
export class BallController extends BaseController {
  readonly __is_ball_ctrl__ = true;
  public target_position: IVector3 = new Ditto.Vector3(0, 0, 0)
  override update(): ControllerUpdateResult {
    const { chasing } = this.entity
    if (chasing) {
      let { x, y, z } = chasing.position
      const cy = this.entity.frame.chasing_y ?? 0.5;
      y = round_float(y + chasing.frame.centery * cy)
      this.target_position.set(x, y, z)
    }
    const { facing, hp, frame } = this.entity
    if (chasing) {
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

      } else {
        this.target_lost(frame, facing);
      }
    } else {
      this.target_lost(frame, facing);
    }
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