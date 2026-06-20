import type { IFrameInfo } from "../defines";
import type { Entity } from "../entity/Entity";
import WeaponState_Base from "./WeaponState_Base";

export default class WeaponState_OnGround extends WeaponState_Base {
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    e.team = e.lf2.new_team;
  }
  override update(e: Entity): void {
    e.handle_ground_velocity_decay();
  }
}
