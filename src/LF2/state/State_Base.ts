import { Defines, INextFrame, ItrKind, StateEnum, type IFrameInfo } from "../defines";
import { ICollision } from "../base/ICollision";
import type { Entity } from "../entity/Entity";
import { spawn_buring_smoke } from "./spawn_buring_smoke";
export class State_Base {
  readonly state: number | string;
  constructor(state: number | string) {
    this.state = state
  }
  on_frame_changed?(e: Entity, frame: IFrameInfo, prev_frame: IFrameInfo): void;
  pre_update?(e: Entity): void;
  update(e: Entity): void {
    switch (e.state) {
      case StateEnum.Burning:
        if (e.update_id.value % 2) e.apply_opoints([spawn_buring_smoke(e, 1)]);
        break;
      case StateEnum.BurnRun:
        if (e.update_id.value % 2) e.apply_opoints([spawn_buring_smoke(e, 2)]);
        break;
    }
  }
  enter?(e: Entity, prev_frame: IFrameInfo): void;
  leave(e: Entity, next_frame: IFrameInfo): void {
    switch (this.state) {
      case StateEnum.HealSelf:
        e.healing = Defines.STATE_HEAL_SELF_HP;
        break;
    }
  }
  on_dead?(e: Entity): void;
  on_landing?(e: Entity): void;
  get_gravity?(e: Entity): number | undefined | null;
  on_be_collided?(collision: ICollision): void;

  get_auto_frame?(e: Entity): IFrameInfo | undefined;

  get_sudden_death_frame?(e: Entity): INextFrame | undefined;

  get_caught_end_frame?(e: Entity): INextFrame | undefined;

  find_frame_by_id?(e: Entity, id: string | undefined): IFrameInfo | undefined;
}
export default State_Base;
