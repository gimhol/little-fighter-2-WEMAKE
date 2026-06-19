import { ActionType } from "../ActionType";
import { IAction_Base } from "./IAction_Base";
import { IAction_NextFrame } from "./IAction_NextFrame";
import type { TNextFrame } from "../INextFrame";

export interface IAction_Defend extends Omit<IAction_NextFrame, 'type'> {
  type: ActionType.A_Defend | ActionType.V_Defend;
  data: TNextFrame;
}
