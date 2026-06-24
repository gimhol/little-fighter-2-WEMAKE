import type { Collision } from "../collision/Collision";
import type { IAction_SetProp, IAction_Sound, TNextFrame } from "../defines";
import type { ActionType } from "../defines/actions/ActionType";
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
import type { IAction_Error } from "../defines/actions/IAction_Error";


type IActionPayloadBase = {
  [K in ActionType]: unknown;
};

interface IActionPayload extends IActionPayloadBase {
  [ActionType.A_SOUND]: IAction_Sound;
  [ActionType.A_NEXT_FRAME]: { data: TNextFrame };
  [ActionType.A_SET_PROP]: IAction_SetProp;
  [ActionType.A_BROKEN_DEFEND]: IAction_BrokenDefend;
  [ActionType.A_DEFEND]: IAction_Defend;
  [ActionType.V_SOUND]: IAction_Sound;
  [ActionType.V_NEXT_FRAME]: { data: TNextFrame };
  [ActionType.V_SET_PROP]: IAction_SetProp;
  [ActionType.V_BROKEN_DEFEND]: IAction_BrokenDefend;
  [ActionType.V_DEFEND]: IAction_Defend;
  [ActionType.A_REBOUND_VX]: IAction_ReboundVX;
  [ActionType.V_REBOUND_VX]: IAction_ReboundVX;
  [ActionType.V_TURN_FACE]: IAction_TurnFace;
  [ActionType.V_TURN_TEAM]: IAction_TurnTeam;
  [ActionType.FUSION]: IAction_Fusion;
  [ActionType.BROADCAST]: IAction_Broadcast;
  [ActionType.VALUE_STEAL]: IAction_StealValue;
  [ActionType.V_BUFF]: IAction_VBuff;
  [ActionType.A_BUFF]: IAction_ABuff;
  [ActionType.ERROR]: IAction_Error;
}

export type IActionHandler = {
  [K in ActionType]: (action: IActionPayload[K], collision: Collision) => any;
};