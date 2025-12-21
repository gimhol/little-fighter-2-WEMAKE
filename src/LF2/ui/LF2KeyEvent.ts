import { LGK } from "../defines";
import { IUIKeyEvent } from "./IUIKeyEvent";
import { LF2UIEvent } from "./LF2UIEvent";

export class LF2KeyEvent extends LF2UIEvent implements IUIKeyEvent {
  readonly player: string;
  readonly game_key: LGK;
  readonly key: string;
  readonly pressed: boolean;
  constructor(player: string, pressed: boolean, key: LGK, key_code: string) {
    super();
    this.player = player;
    this.game_key = key;
    this.key = key_code;
    this.pressed = pressed
  }
}
