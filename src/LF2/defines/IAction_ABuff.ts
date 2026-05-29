import { ActionType } from "./ActionType";
import { IAction_Base } from "./IAction_Base";

export interface IAction_ABuff extends IAction_Base {
  type: ActionType.A_BUFF;
  data: {
    duration: number;
    buff: string;
  };
}
export interface IAction_VBuff extends IAction_Base {
  type: ActionType.V_BUFF;
  data: {
    duration: number;
    buff: string;
  };
}