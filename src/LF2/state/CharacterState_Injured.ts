import { IFrameInfo, StateEnum, WeaponType } from "../defines";
import { Entity } from "../entity";
import CharacterState_Base from "./CharacterState_Base";

export class CharacterState_Injured extends CharacterState_Base {
  constructor(state: StateEnum = StateEnum.Injured) {
    super(state);
  }
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    super.enter?.(e, prev_frame);
    e.ctrl.reset_key_list();
    if (e.holding?.data.base.type === WeaponType.Heavy)
      e.drop_holding() 
  }
}
