import { StateEnum } from "../defines";
import { Entity } from "../entity/Entity";
import { is_fighter } from "../entity/type_check";
import { abs, round } from "../utils";
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Teleport2FarthestAlly extends CharacterState_Base {
  constructor(state: StateEnum = StateEnum.TeleportToFarthestAlly) {
    super(state)
  }
  override enter(m: Entity): void {
    let _dis: number = -1;
    let _tar: Entity | undefined;
    for (const o of m.world.entities) {
      if (!is_fighter(o) || o === m || !o.is_ally(m)) continue;

      const dis =
        abs(o.position.x - m.position.x) +
        abs(o.position.z - o.position.z);
      if (dis > _dis) {
        _dis = dis;
        _tar = o;
      }
    }

    if (!_tar) {
      m.position.y = 0;
      return;
    }
    m.position.x = round(_tar.position.x - m.facing * 60);
    m.position.z = round(_tar.position.z);
    m.position.y = 0;
  }
}
