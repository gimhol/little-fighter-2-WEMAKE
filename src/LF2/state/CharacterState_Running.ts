import { StateEnum } from "../defines";
import type { Entity } from "../entity/Entity";
import { round_float } from "../utils";
import { abs } from "../utils/math/base";
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Running extends CharacterState_Base {
  constructor(state: StateEnum = StateEnum.Running) {
    super(state)
  }
  override update(e: Entity): void {
    super.update(e);
    let { x, z } = e.velocity;
    if (z) {
      const dz = abs(z / 4);
      if (x > dz) x -= dz;
      if (x < -dz) x += dz;
      e.set_velocity_x(x)
    }

    if (e.hp <= 0) {
      e.enter_frame(e.get_sudden_death_frame());
    }
  }
}
