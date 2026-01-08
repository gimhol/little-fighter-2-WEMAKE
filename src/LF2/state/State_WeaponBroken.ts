import { StateEnum } from "../defines";
import { GONE_FRAME_INFO } from "../defines/GONE_FRAME_INFO";
import type { Entity } from "../entity/Entity";
import State_Base from "./State_Base";

export class State_WeaponBroken extends State_Base {
  constructor(state: StateEnum = StateEnum.Weapon_Brokens) {
    super(state)
  }
  override on_landing(e: Entity): void {
    e.enter_frame(GONE_FRAME_INFO);
  }
}
