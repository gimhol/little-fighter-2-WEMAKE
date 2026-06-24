import type { IAction_Base } from "./IAction_Base";
import { ActionType } from "./ActionType";

export interface IAction_ReboundVX extends IAction_Base {
  type: ActionType.A_REBOUND_VX | ActionType.V_REBOUND_VX;
}
