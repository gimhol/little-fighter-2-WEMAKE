import { ActionType } from "./ActionType";
import type { IAction_NextFrame } from "./IAction_NextFrame";
import type { TNextFrame } from "../INextFrame";

export interface IAction_BrokenDefend extends Omit<IAction_NextFrame, 'type'> {
  type: ActionType.A_BROKEN_DEFEND | ActionType.V_BROKEN_DEFEND;
  data: TNextFrame;
}
