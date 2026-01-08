import { StateEnum } from "../defines";
import type { Entity } from "../entity/Entity";
import { abs } from "../utils/math/base";
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Running extends CharacterState_Base {
  constructor(state: StateEnum = StateEnum.Running) {
    super(state)
  }
  override update(e: Entity): void {
    super.update(e);
    if (e.velocity.z) {
      const dz = abs(e.velocity.z / 4);
      if (e.velocity.x > 0) {
        e.velocity.x -= dz;
      } else if (e.velocity.x < 0) {
        e.velocity.x += dz;
      }
    }
    if (e.hp <= 0) {
      e.enter_frame(e.get_sudden_death_frame());
    }
  }
}
