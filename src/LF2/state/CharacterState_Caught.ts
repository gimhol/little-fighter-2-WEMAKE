import { StateEnum, WeaponType } from "../defines";
import { Entity } from "../entity/Entity";
import CharacterState_Base from "./CharacterState_Base";

export class CharacterState_Caught extends CharacterState_Base {
  constructor(state: StateEnum = StateEnum.Caught) {
    super(state)
  }
  override enter(e: Entity): void {
    e.ctrl.reset_key_list();
    e.fall_value = e.fall_value_max;
    e.set_velocity(0, 0, 0);
    const holding = e.holding
    // TODO: the drop position is not the same as LF2, should I figure it out?
    if (holding) e.drop_holding();
    if (holding?.base_type === WeaponType.Heavy)
      holding.team = e.team;
  }
  override update(e: Entity): void {
    e.set_velocity(0, 0, 0);
  }
}
