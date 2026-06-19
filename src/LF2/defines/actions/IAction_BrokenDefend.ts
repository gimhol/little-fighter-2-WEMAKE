import { ActionType } from "../ActionType";
import { IAction_NextFrame } from "./IAction_NextFrame";
import type { TNextFrame } from "../INextFrame";

export interface IAction_BrokenDefend extends Omit<IAction_NextFrame, 'type'> {
  type: ActionType.A_BrokenDefend | ActionType.V_BrokenDefend;
  data: TNextFrame;
}
