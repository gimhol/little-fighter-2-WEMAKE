import { StateEnum } from "../defines";
import type { Entity } from "../entity/Entity";
import { abs, sqrt } from "../utils";
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Jump extends CharacterState_Base {
  private _jumpings = new Set<Entity>();
  constructor(state: StateEnum = StateEnum.Jump) {
    super(state)
  }
  override update(e: Entity): void {
    e.handle_ground_velocity_decay();

    const { jump_flag } = e.get_prev_frame();
    if (!jump_flag) {
      this._jumpings.delete(e);
      return;
    }
    if (this._jumpings.has(e)) {
      return;
    }
    const { LR: LR1 = 0, UD: UD1 = 0 } = e.ctrl || {};
    let {
      jump_height: h = 0,
      jump_distance: dx = 0,
      jump_distancez: dz = 0,
    } = e.data.base;
    dz *= e.world.jump_z_f
    dx *= e.world.jump_x_f
    h *= e.world.jump_h_f
    const { gravity } = e;
    const vz = UD1 * dz;
    const vx = LR1 * (dx - abs(vz / 4))
    const vy = gravity * sqrt((2 * h) / gravity)
    e.set_velocity(vx, vy, vz);
    this._jumpings.add(e);
  }
  override on_landing(e: Entity): void {
    e.enter_frame({ id: e.data.indexes?.landing_1 });
  }
}
