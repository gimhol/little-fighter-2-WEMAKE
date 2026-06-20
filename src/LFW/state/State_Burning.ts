
import { StateEnum } from "../defines";
import CharacterState_Burning from "./CharacterState_Burning";
import { StateBase_Proxy } from "./StateBase_Proxy";

export class State_Burning extends StateBase_Proxy {

  constructor(state: StateEnum = StateEnum.Burning) {
    super(
      state,
      new CharacterState_Burning(),
      void 0,
      void 0,
      void 0
    );
  }
}
