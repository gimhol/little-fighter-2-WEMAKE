import { ActionType } from "./ActionType";
import type { IAction_Base } from "./IAction_Base";

export interface IAction_SetProp extends IAction_Base {
  type: ActionType.A_SET_PROP | ActionType.V_SET_PROP;
  data?: {
    name?: string;
    value?: unknown;
  }
}
