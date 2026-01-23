import type { ICollision } from "./ICollision";
import type { IAction_SetProp, IAction_Sound, TNextFrame } from "../defines";
import type { ActionType } from "../defines/ActionType";
import type { IAction_Broadcast } from "../defines/IAction_Broadcast";
import type { IAction_BrokenDefend } from "../defines/IAction_BrokenDefend";
import type { IAction_Defend } from "../defines/IAction_Defend";
import type { IAction_Fusion } from "../defines/IAction_Fusion";
import type { IAction_ReboundVX } from "../defines/IAction_ReboundVX";
import type { IAction_TurnFace } from "../defines/IAction_TurnFace";
import type { IAction_TurnTeam } from "../defines/IAction_TurnTeam";

export interface IActionHandler {
  [ActionType.A_Sound]: (action: IAction_Sound, collision: ICollision) => any;
  [ActionType.A_NextFrame]: (action: { data: TNextFrame }, collision: ICollision) => any;
  [ActionType.A_SetProp]: (action: IAction_SetProp, collision: ICollision) => any;
  [ActionType.A_BrokenDefend]: (action: IAction_BrokenDefend, collision: ICollision) => any;
  [ActionType.A_Defend]: (action: IAction_Defend, collision: ICollision) => any;
  [ActionType.V_Sound]: (action: IAction_Sound, collision: ICollision) => any;
  [ActionType.V_NextFrame]: (action: { data: TNextFrame }, collision: ICollision) => any;
  [ActionType.V_SetProp]: (action: IAction_SetProp, collision: ICollision) => any;
  [ActionType.V_BrokenDefend]: (action: IAction_BrokenDefend, collision: ICollision) => any;
  [ActionType.V_Defend]: (action: IAction_Defend, collision: ICollision) => any;
  [ActionType.A_REBOUND_VX]: (action: IAction_ReboundVX, collision: ICollision) => any;
  [ActionType.V_REBOUND_VX]: (action: IAction_ReboundVX, collision: ICollision) => any;
  [ActionType.V_TURN_FACE]: (action: IAction_TurnFace, collision: ICollision) => any;
  [ActionType.V_TURN_TEAM]: (action: IAction_TurnTeam, collision: ICollision) => any;
  [ActionType.FUSION]: (action: IAction_Fusion, collision: ICollision) => any;
  [ActionType.BROADCAST]: (action: IAction_Broadcast, collision: ICollision) => any;
}