import { ActionType } from "./ActionType";
import type { IAction_Base } from "./IAction_Base";
import type { IAction_NextFrame } from "./IAction_NextFrame";
import type { TNextFrame } from "../INextFrame";

export interface IAction_Defend extends Omit<IAction_NextFrame, 'type'> {
  type: ActionType.A_DEFEND | ActionType.V_DEFEND;
  data: TNextFrame;
}
