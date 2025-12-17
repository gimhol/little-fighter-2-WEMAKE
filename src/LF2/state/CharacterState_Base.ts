import { IFrameInfo, INextFrame, StateEnum, WeaponType } from "../defines";
import type { Entity } from "../entity/Entity";
import State_Base from "./State_Base";

export default class CharacterState_Base extends State_Base {
  override pre_update(e: Entity): void {
    switch (this.state) {
      case StateEnum.Falling:
      case StateEnum.Caught:
      case StateEnum.Injured:
      case StateEnum.Frozen:
      case StateEnum.Burning:
        break;
      default:
        e.update_resting();
    }
  }
  override update(e: Entity): void {
    super.update(e)
    e.handle_ground_velocity_decay();
  }
  override on_landing(e: Entity): void {
    e.enter_frame({ id: e.data.indexes?.landing_2 });
  }
  override get_auto_frame(e: Entity): IFrameInfo | undefined {
    let fid: string | undefined;
    if (e.holding?.data.base.type === WeaponType.Heavy) {
      fid = e.data.indexes?.heavy_obj_walk?.[0];
    } else if (e.position.y > e.ground_y) {
      fid = e.data.indexes?.in_the_skys?.[0];
    } else if (e.hp > 0) {
      fid = e.data.indexes?.standing;
    } else {
      fid = e.data.indexes?.standing; // TODO
    }
    if (!fid) return void 0;
    return e.data.frames[fid];
  }

  override get_sudden_death_frame(target: Entity): INextFrame | undefined {
    target.velocity_0.y = 2;
    target.velocity_0.x = 2 * target.facing;
    if (target.data.indexes?.falling)
      return { id: target.data.indexes?.falling[1][1] };
    return void 0;
  }

  override get_caught_end_frame(target: Entity): INextFrame | undefined {
    target.velocity_0.y = target.world.cvy_d;
    target.velocity_0.x = -1 * target.world.cvx_d * target.facing;
    if (target.data.indexes?.falling)
      return { id: target.data.indexes.falling[-1][1] };
    return void 0;
  }
}
