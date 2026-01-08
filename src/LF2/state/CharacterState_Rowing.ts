import { IFrameInfo, SpeedMode, StateEnum } from "../defines";
import { calc_v } from "../entity/calc_v";
import { Entity } from "../entity/Entity";
import { sqrt } from "../utils";
import CharacterState_Base from "./CharacterState_Base";

export class CharacterState_Rowing extends CharacterState_Base {
  constructor(state: StateEnum = StateEnum.Rowing) {
    super(state)
  }
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    if (e.position.y <= e.ground_y) return;
    const { rowing_distance: dx = 0, rowing_height: h = 0 } = e.data.base;

    e.merge_velocities();
    const { x: prev_vx, y: prev_vy } = e.velocity;
    const next_vx = prev_vx >= 0 ? dx : -dx;
    const g_acc = e.world.gravity;
    const vy = g_acc * sqrt((2 * h) / g_acc);
    const next_vy = calc_v(prev_vy, vy, SpeedMode.LF2, 0)
    e.set_velocity(next_vx, next_vy);
  }
  override on_landing(e: Entity): void {
    e.enter_frame({ id: e.data.indexes?.landing_1 });
  }
}
