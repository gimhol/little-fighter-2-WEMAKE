import { ActionType } from "./ActionType";
import type { IAction_Base } from "./IAction_Base";

export interface IAction_Error extends IAction_Base {
  type: ActionType.ERROR;
  data: { msg: string };
}
