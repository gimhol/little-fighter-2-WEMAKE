import { IFrameInfo } from "../defines";
import type { Entity } from "../entity/Entity";
import { round_float } from "../utils";
import WeaponState_Base from "./WeaponState_Base";

export default class WeaponState_Throwing extends WeaponState_Base {
  /**
   * 用于确保丢出的武器只受一次跌落伤害
   * @protected
   * @type {Set<Entity>}
   */
  protected _unhurt_weapons: Set<Entity> = new Set<Entity>();
  override get_gravity(e: Entity) {
    return e.world.gravity * 0.45;
  }
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    this._unhurt_weapons.add(e);
    e.merge_velocities();
  }
  override leave(e: Entity, next_frame: IFrameInfo): void {
    this._unhurt_weapons.delete(e);
  }
  override on_landing(e: Entity): void {
    const { y: vy } = e.landing_velocity;
    const { base, indexes } = e.data;
    const dvy = round_float(-vy * (base.bounce ?? 0));
    const min_bounce_vy = 1;
    if (this._unhurt_weapons.has(e)) {
      this._unhurt_weapons.delete(e);
      if (base.drop_hurt) {
        e.hp -= base.drop_hurt;
        e.hp_r -= base.drop_hurt;
      }
    }
    if (dvy < min_bounce_vy) {
      e.enter_frame({
        id: indexes?.throw_on_ground || indexes?.just_on_ground,
      });
    } else {
      e.set_velocity_y(dvy);
    }
  }
  override update(e: Entity): void {
    e.handle_ground_velocity_decay();
  }
}
