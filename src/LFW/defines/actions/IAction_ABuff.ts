import { ActionType } from "./ActionType";
import { HitFlag } from "../HitFlag";
import type { IAction_Base } from "./IAction_Base";

export interface IAction_ABuff extends IAction_Base {
  type: ActionType.A_BUFF;
  data?: {
    hitflag?: HitFlag
    duration?: number;
    buff?: string;
  };
}
