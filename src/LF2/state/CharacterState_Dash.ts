import { StateEnum, type IFrameInfo } from "../defines";
import type { Entity } from "../entity/Entity";
import { round, sqrt } from "../utils";
import CharacterState_Base from "./CharacterState_Base";
export default class CharacterState_Dash extends CharacterState_Base {
  constructor(state: StateEnum = StateEnum.Dash) {
    super(state)
  }
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    if (e.position.y > e.ground_y && e.velocity.y !== 0) return;
    const { gravity } = e;
    const { x: vx, y: vy, z: vz } = e.velocity;
    let next_vx = vx;
    let next_vy = vy;
    let next_vz = vz;
    let {
      dash_distance: dx = e.world_dataset('dash_distance'),
      dash_distancez: dz = e.world_dataset('dash_distancez'),
      dash_height: h = e.world_dataset('dash_height'),
    } = e.data.base;
    h = round(h * h / 3.5)
    dx *= e.world_dataset('dash_x_f')
    dz *= e.world_dataset('dash_z_f')
    h *= e.world_dataset('dash_h_f')

    next_vy = gravity * sqrt((2 * h) / gravity);
    const { UD: UD1 = 0, LR: LR1 = 0 } = e.ctrl || {};
    if (UD1) next_vz = UD1 * dz;
    if (prev_frame.state === StateEnum.Running) {
      next_vx = e.facing * dx;
    } else if (LR1) next_vx = LR1 * dx;
    else if (vx > 0) next_vx = dx;
    else if (vx < 0) next_vx = -dx;
    else next_vx = e.facing * dx;

    e.set_velocity(next_vx, next_vy, next_vz)
  }
}
