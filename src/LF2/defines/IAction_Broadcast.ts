import { ActionType } from "./ActionType";
import { IAction_Base } from "./IAction_Base";

export interface IAction_Broadcast extends IAction_Base {
  type: ActionType.BROADCAST;
  data: string;
}
