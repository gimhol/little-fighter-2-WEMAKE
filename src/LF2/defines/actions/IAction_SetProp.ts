import { ActionType } from "../ActionType";
import type { IAction_Base } from "./IAction_Base";

export interface IAction_SetProp extends IAction_Base {
  type: ActionType.A_SetProp | ActionType.V_SetProp;
  prop_name: string;
  prop_value: any;
  /*
  改为
  data: {
    name: string;
    value: any;
  }
  */
}
