import { GK } from "../defines";
import type { IUIKeyEvent } from "./IUIKeyEvent";
import { LFWUIEvent } from "./LFWUIEvent";

export class LFWKeyEvent extends LFWUIEvent implements IUIKeyEvent {
  readonly player: string;
  readonly game_key: GK;
  readonly key: string;
  readonly pressed: boolean;
  constructor(player: string, pressed: boolean, key: GK, key_code: string) {
    super();
    this.player = player;
    this.game_key = key;
    this.key = key_code;
    this.pressed = pressed
  }
}
