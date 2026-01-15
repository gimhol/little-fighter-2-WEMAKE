import { IFrameInfo } from "../defines";
import type { Entity } from "../entity/Entity";
import WeaponState_Base from "./WeaponState_Base";

export default class WeaponState_Throwing extends WeaponState_Base {
  override get_gravity(e: Entity) {
    return e.world.gravity * 0.45;
  }
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    this._hit_ground_weapons.add(e);
    e.merge_velocities();
  }
  override leave(e: Entity, next_frame: IFrameInfo): void {
    this._hit_ground_weapons.delete(e);
  }
  override on_landing(e: Entity): void {
    const { indexes } = e.data;
    this.hit_ground_rebouncing(e, indexes?.throw_on_ground || indexes?.just_on_ground);
  }
  override update(e: Entity): void {
    e.handle_ground_velocity_decay();
  }
}
