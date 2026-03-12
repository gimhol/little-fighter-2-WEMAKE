import { StateEnum } from "../defines";
import type { Entity } from "../entity/Entity";
import { abs, round, sqrt } from "../utils";
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
      jump_height: vy = e.dataset('jump_height'),
      jump_distance: vx = e.dataset('jump_distance'),
      jump_distancez: vz = e.dataset('jump_distancez'),
    } = e.data.base;

    vz *= UD1 * e.dataset('jump_z_f')
    vx = LR1 * (vx * e.dataset('jump_x_f') - abs(vz / 4))
    vy *= e.dataset('jump_h_f')

    e.set_velocity(vx, vy, vz);
    this._jumpings.add(e);
  }
  override on_landing(e: Entity): void {
    e.enter_frame({ id: e.data.indexes?.landing_1 });
  }
}
