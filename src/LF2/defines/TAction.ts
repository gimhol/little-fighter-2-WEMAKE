import type { IAction_Broadcast } from "./IAction_Broadcast";
import type { IAction_BrokenDefend } from "./IAction_BrokenDefend";
import type { IAction_Defend } from "./IAction_Defend";
import type { IAction_Fusion } from "./IAction_Fusion";
import type { IAction_NextFrame } from "./IAction_NextFrame";
import type { IAction_ReboundVX } from "./IAction_ReboundVX";
import type { IAction_SetProp } from "./IAction_SetProp";
import type { IAction_Sound } from "./IAction_Sound";
import type { IAction_TurnFace } from "./IAction_TurnFace";
import type { IAction_TurnTeam } from "./IAction_TurnTeam";


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
  IAction_Broadcast;
