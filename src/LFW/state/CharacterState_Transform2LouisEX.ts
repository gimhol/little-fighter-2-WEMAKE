import { StateEnum } from "../defines";
import type { Entity } from "../entity/Entity";
import State_Base from "./State_Base";
export class CharacterState_TransformToLouisEX extends State_Base {
  constructor(state: StateEnum = StateEnum.TurnIntoLouisEX) {
    super(state)
  }
  override enter(e: Entity): void {
    const d = e.lf2.datas.find_fighter("50");
    if (d) {
      e.transform(d);
      e.enter_frame(e.find_auto_frame());
    }
  }
}
