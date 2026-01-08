import { IFrameInfo, StateEnum } from "../defines";
import type { Entity } from "../entity/Entity";
import CharacterState_Base from "./CharacterState_Base";
import { spawn_ice_piece } from "./spawn_ice_piece";

export default class CharacterState_Frozen extends CharacterState_Base {
  constructor(state: StateEnum = StateEnum.Frozen) {
    super(state)
  }
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    e.ctrl.reset_key_list();
  }
  override leave(e: Entity, next_frame: IFrameInfo): void {
    e.play_sound(["data/066.wav.mp3"]);
    if (e.data.indexes?.ice !== next_frame.id) {
      e.apply_opoints([
        spawn_ice_piece(e, "130"),
        spawn_ice_piece(e, "130"),
        spawn_ice_piece(e, "130"),
        spawn_ice_piece(e, "120"),
        spawn_ice_piece(e, "120"),
        spawn_ice_piece(e, "125"),
        spawn_ice_piece(e, "125"),
        spawn_ice_piece(e, "125"),
        spawn_ice_piece(e, "125"),
        spawn_ice_piece(e, "135"),
        spawn_ice_piece(e, "135"),
        spawn_ice_piece(e, "135"),
        spawn_ice_piece(e, "135"),
        spawn_ice_piece(e, "135"),
        spawn_ice_piece(e, "135"),
        spawn_ice_piece(e, "135"),
      ]);
    }
    super.leave?.(e, next_frame);
  }
  override on_landing(e: Entity): void {
    const {
      data: { indexes },
    } = e;
    const { y: vy } = e.velocity;
    if (vy <= e.world.cha_bc_tst_spd_y * 2) {
      e.enter_frame({ id: indexes?.bouncing?.[-1][0] });
      e.set_velocity_y(e.world.cha_bc_spd)
      e.hp -= 10;
    }
  }
}
