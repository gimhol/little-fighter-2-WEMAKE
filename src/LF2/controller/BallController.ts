
import { FrameBehavior, GK, IChaseInfo } from "../defines";
import { ChaseLost } from "../defines/ChaseLost";
import type { Entity } from "../entity/Entity";
import { round_float } from "../utils";
import { BaseController } from "./BaseController";
import { type ControllerUpdateResult } from "./ControllerUpdateResult";
const { L, R, U, D, j, d } = GK
export class BallController extends BaseController {
  readonly __is_ball_ctrl__ = true;
  private _chasing: Entity | null | undefined = void 0;

  override update(): ControllerUpdateResult {
    const { frame: { chase, behavior }, facing } = this.entity;
    if (behavior === FrameBehavior.JohnBiscuitLeaving) {
      const p1 = this.entity.position;
      this.key_down(facing < 0 ? L : R).key_up(facing < 0 ? R : L, U, D);
      if (p1.y > 40) this.key_down(d).key_up(j);
      else if (p1.y < 40) this.key_down(j).key_up(d);
      else this.key_up(j, d);
    }
    if (chase) this.update_chasing(chase)
    return super.update();
  }
  private update_chasing(chase: IChaseInfo) {
    const { chasing, facing, hp } = this.entity;
    if (!this._chasing && chasing) this.start_chasing(chase)
    const me = this.entity.position;

    let { x, y, z } = chasing?.position || this.chase_pos;
    if (chasing)
      y = round_float(y + chasing.frame.centery * (chase.oy ?? 0.5))

    if (hp > 0 && (this._chasing || (chase.lost & ChaseLost.Hover))) {
      this.entity.merge_velocities();
      if (x < me.x) this.key_down(L).key_up(R)
      else if (x > me.x) this.key_down(R).key_up(L)
      else this.key_up(L, R)
      if (z < me.z) this.key_down(U).key_up(D)
      else if (z > me.z) this.key_down(D).key_up(U)
      else this.key_up(U, D)

      if (me.y > y) this.key_down(d).key_up(j)
      else if (me.y < y) this.key_down(j).key_up(d)
      else this.key_up(j, d)
    } else {
      const p1 = this.entity.position;
      this.key_down(facing < 0 ? L : R).key_up(facing < 0 ? R : L, U, D);
      if (p1.y > y) this.key_down(d).key_up(j)
      else if (p1.y < y) this.key_down(j).key_up(d)
      else this.key_up(j, d)
    }
    if (this._chasing && !chasing)
      this.end_chasing(chase)
    this._chasing = chasing;
  }
  private start_chasing(chase: IChaseInfo) {

  }
  private end_chasing(chase: IChaseInfo) {
    this.set_chase_pos(
      this.entity.position.x,
      this.entity.position.y,
      this.entity.position.z,
    )
  }
}