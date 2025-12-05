
import { IFrameInfo, StateEnum } from "../defines";
import type { Entity } from "../entity/Entity";
import { abs } from "../utils/math";
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Burning extends CharacterState_Base {
  private _bouncings = new Set<Entity>()
  constructor() {
    super(StateEnum.Burning)
  }
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    super.update(e);
    e.ctrl.reset_key_list();
  }
  override update(e: Entity): void {
    super.update(e);
    const vx = e.velocity.x
    if (vx) e.facing = vx > 0 ? -1 : 1;
  }
  override leave(e: Entity, next_frame: IFrameInfo): void {
    super.leave(e, next_frame);
    this._bouncings.delete(e)
  }
  override on_landing(e: Entity): void {
    const { y: vy, x: vx } = e.velocity;
    const {
      data: { indexes },
    } = e;
    if (
      !this._bouncings.has(e) && (
        vy <= e.world.cha_bc_tst_spd_y ||
        abs(vx) > e.world.cha_bc_tst_spd_x
      )
    ) {
      e.enter_frame({ id: indexes?.bouncing?.[-1][1] });
      e.merge_velocities()
      e.velocity_0.y = e.world.cha_bc_spd;
      this._bouncings.add(e)
    } else {
      e.enter_frame({ id: indexes?.lying?.[-1] });
    }
  }
}

