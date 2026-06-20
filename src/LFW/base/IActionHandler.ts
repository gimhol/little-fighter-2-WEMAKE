import type { Collision } from "../collision/Collision";
import type { IAction_SetProp, IAction_Sound, TNextFrame } from "../defines";
import type { ActionType } from "../defines/ActionType";
import type { IAction_Broadcast } from "../defines/actions/IAction_Broadcast";
import type { IAction_BrokenDefend } from "../defines/actions/IAction_BrokenDefend";
import type { IAction_Defend } from "../defines/actions/IAction_Defend";
import type { IAction_Fusion } from "../defines/actions/IAction_Fusion";
import type { IAction_StealValue } from "../defines/actions/IAction_StealValue";
import type { IAction_ReboundVX } from "../defines/actions/IAction_ReboundVX";
import type { IAction_TurnFace } from "../defines/actions/IAction_TurnFace";
import type { IAction_TurnTeam } from "../defines/actions/IAction_TurnTeam";
import type { IAction_ABuff } from "../defines/actions/IAction_ABuff";
import type { IAction_VBuff } from "../defines/actions/IAction_VBuff";

export interface IActionHandler {
  [ActionType.A_Sound]: (action: IAction_Sound, collision: Collision) => any;
  [ActionType.A_NextFrame]: (action: { data: TNextFrame }, collision: Collision) => any;
  [ActionType.A_SetProp]: (action: IAction_SetProp, collision: Collision) => any;
  [ActionType.A_BrokenDefend]: (action: IAction_BrokenDefend, collision: Collision) => any;
  [ActionType.A_Defend]: (action: IAction_Defend, collision: Collision) => any;
  [ActionType.V_Sound]: (action: IAction_Sound, collision: Collision) => any;
  [ActionType.V_NextFrame]: (action: { data: TNextFrame }, collision: Collision) => any;
  [ActionType.V_SetProp]: (action: IAction_SetProp, collision: Collision) => any;
  [ActionType.V_BrokenDefend]: (action: IAction_BrokenDefend, collision: Collision) => any;
  [ActionType.V_Defend]: (action: IAction_Defend, collision: Collision) => any;
  [ActionType.A_REBOUND_VX]: (action: IAction_ReboundVX, collision: Collision) => any;
  [ActionType.V_REBOUND_VX]: (action: IAction_ReboundVX, collision: Collision) => any;
  [ActionType.V_TURN_FACE]: (action: IAction_TurnFace, collision: Collision) => any;
  [ActionType.V_TURN_TEAM]: (action: IAction_TurnTeam, collision: Collision) => any;
  [ActionType.FUSION]: (action: IAction_Fusion, collision: Collision) => any;
  [ActionType.BROADCAST]: (action: IAction_Broadcast, collision: Collision) => any;
  [ActionType.VALUE_STEAL]: (action: IAction_StealValue, collision: Collision) => any;
  [ActionType.V_BUFF]: (action: IAction_VBuff, collision: Collision) => any;
  [ActionType.A_BUFF]: (action: IAction_ABuff, collision: Collision) => any;
}