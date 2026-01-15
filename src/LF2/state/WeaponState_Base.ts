import { IFrameInfo } from "../defines";
import type { Entity } from "../entity/Entity";
import { round_float } from "../utils";
import State_Base from "./State_Base";

export default class WeaponState_Base extends State_Base {
  /**
   * 用于确保丢出的武器只受一次跌落伤害
   * @protected
   * @type {Set<Entity>}
   */
  protected _hit_ground_weapons: Set<Entity> = new Set<Entity>();
  override get_auto_frame(e: Entity): IFrameInfo | undefined {
    const { frames, indexes } = e.data;
    if (e.position.y > e.ground_y) {
      const fid = indexes?.in_the_skys?.[0];
      return fid ? frames[fid] : void 0
    }
    return indexes?.on_ground ? frames[indexes.on_ground] : void 0;
  }

  override update(e: Entity): void {
    e.handle_ground_velocity_decay();
  }

  hit_ground_rebouncing(e: Entity, nf: string | undefined) {
    const { y: vy, x: vx, z: vz } = e.landing_velocity;
    const { base, indexes } = e.data;
    const dvy = round_float(-vy * (base.bounce ?? 0));
    const dvx = round_float(vx * 0.5);
    const dvz = round_float(vz * 0.5);
    const min_bounce_vy = 0.5;
    if (this._hit_ground_weapons.has(e)) {
      this._hit_ground_weapons.delete(e);
      if (base.drop_hurt) {
        e.hp = e.hp - base.drop_hurt;
        e.hp_r = e.hp_r - base.drop_hurt;
      }
    }
    if (dvy < min_bounce_vy) {
      e.enter_frame({ id: nf });
    } else {
      e.set_velocity(dvx, dvy, dvz);
    }
  }
}
