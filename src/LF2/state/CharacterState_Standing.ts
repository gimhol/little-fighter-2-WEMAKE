import { StateEnum } from "../defines";
import type { Entity } from "../entity/Entity";
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Standing extends CharacterState_Base {
  constructor(state: StateEnum = StateEnum.Standing) {
    super(state)
  }
  override update(e: Entity): void {
    super.update(e);
    if (e.hp <= 0) {
      e.enter_frame(e.get_sudden_death_frame());
    } else if (e.position.y > e.ground_y) {
      e.enter_frame({ id: e.data.indexes?.in_the_skys?.[0] });
    }
  }
}
