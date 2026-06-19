import type { IAction_ABuff } from "./actions/IAction_ABuff";
import type { IAction_VBuff } from "./actions/IAction_VBuff";
import type { IAction_Broadcast } from "./actions/IAction_Broadcast";
import type { IAction_BrokenDefend } from "./actions/IAction_BrokenDefend";
import type { IAction_Defend } from "./actions/IAction_Defend";
import type { IAction_Fusion } from "./actions/IAction_Fusion";
import type { IAction_NextFrame } from "./actions/IAction_NextFrame";
import type { IAction_ReboundVX } from "./actions/IAction_ReboundVX";
import type { IAction_SetProp } from "./actions/IAction_SetProp";
import type { IAction_Sound } from "./actions/IAction_Sound";
import type { IAction_StealValue } from "./actions/IAction_StealValue";
import type { IAction_TurnFace } from "./actions/IAction_TurnFace";
import type { IAction_TurnTeam } from "./actions/IAction_TurnTeam";


export type TAction =
  IAction_Sound |
  IAction_NextFrame |
  IAction_SetProp |
  IAction_Defend |
  IAction_BrokenDefend |
  IAction_ReboundVX |
  IAction_TurnFace |
  IAction_TurnTeam |
  IAction_Fusion |
  IAction_Broadcast |
  IAction_StealValue |
  IAction_ABuff |
  IAction_VBuff;
