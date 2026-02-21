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
    let { z: vz, x: vx } = e.velocity_0;
    if (vz) {
      const dz = abs(vz / 4);
      if (vx > dz) vx -= dz;
      if (vx < -dz) vx += dz;
      e.set_velocity_0_x(vx);
    }

    if (e.hp <= 0) {
      e.enter_frame(e.get_sudden_death_frame());
    }
  }
}
