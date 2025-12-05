import { StateEnum } from "../defines";
import { Entity } from "../entity/Entity";
import CharacterState_Base from "./CharacterState_Base";

export class CharacterState_Caught extends CharacterState_Base {
  constructor(state: StateEnum = StateEnum.Caught) {
    super(state)
  }
  override enter(e: Entity): void {
    e.ctrl.reset_key_list();
    e.fall_value = e.fall_value_max;
    e.velocities.length = 1;
    e.velocity_0.set(0, 0, 0);
    e.drop_holding();
  }
  override update(e: Entity): void {
    e.velocities.length = 1;
    e.velocity_0.set(0, 0, 0);
  }
}
