import type { GK } from "../defines";
import type { IUIEvent } from "./UIEvent";

export interface IUIKeyEvent extends IUIEvent {
  player: string;
  key: string;
  game_key: GK;
  pressed: boolean;
}

