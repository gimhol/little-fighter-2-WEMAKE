import { GK, IFrameInfo, SpeedCtrl, StateEnum } from "../defines";
import { is_bot_ctrl } from "../entity";
import type { Entity } from "../entity/Entity";
import { abs } from "../utils";
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Jump extends CharacterState_Base {
  private _jumpings = new Set<Entity>();
  private _forces = new Map<Entity, { x: number, y: number, z: number, t: number }>();
  constructor(state: StateEnum = StateEnum.Jump) {
    super(state)
  }
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    if (e.position.y === 0) {
      this._jumpings.delete(e)
      this._forces.delete(e)
    }
  }
  override update(e: Entity): void {
    e.handle_ground_velocity_decay();

    const { jump_flag } = e.get_prev_frame();
    if (!jump_flag) {
      if (!is_bot_ctrl(e.ctrl)) {
        const force = this._forces.get(e)
        if (!force) {
          this._forces.set(e, { x: 0, y: 0, z: 0, t: 0 })
        } else {
          force.t += 1;
          if (!e.ctrl.is_end(GK.R)) force.x += 1;
          if (!e.ctrl.is_end(GK.L)) force.x -= 1;
          if (!e.ctrl.is_end(GK.U)) force.z -= 1;
          if (!e.ctrl.is_end(GK.D)) force.z += 1;
          if (!e.ctrl.is_end(GK.j)) force.y += 1;
        }
      }
      return;
    }
    if (this._jumpings.has(e)) return;
    const { LR: LR1 = 0, UD: UD1 = 0 } = e.ctrl || {};
    let {
      jump_height: vy = e.dataset('jump_height'),
      jump_distance: vx = e.dataset('jump_distance'),
      jump_distancez: vz = e.dataset('jump_distancez'),
    } = e.data.base;

    vz *= UD1 * e.dataset('jump_z_f')
    vx = LR1 * (vx * e.dataset('jump_x_f') - abs(vz / 4))
    vy *= e.dataset('jump_h_f')
    const f = this._forces.get(e);
    if (f) {
      const min = 4;
      if (f.t) {
        vy = min + (vy - min) * f.y / f.t
      } else {
        vy = min;
      }
    }
    e.set_velocity(vx, vy, vz);
    this._jumpings.add(e);
  }
  override on_landing(e: Entity): void {
    e.enter_frame({ id: e.data.indexes?.landing_1 });
    e.update_velocity({ dvz: 4, ctrl_z: SpeedCtrl.Control })
  }
}
