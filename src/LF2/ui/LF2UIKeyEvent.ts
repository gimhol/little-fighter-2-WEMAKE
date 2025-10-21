import { LGK } from "../defines";
import { IUIKeyEvent } from "./IUIKeyEvent";
import { LF2UIEvent } from "./LF2UIEvent";

export class LF2UIKeyEvent extends LF2UIEvent implements IUIKeyEvent {
  protected _player: string;
  protected _key: LGK;
  protected _key_code: string;
  get player(): string { return this._player; }
  get game_key(): LGK { return this._key; }
  get key(): string { return this._key_code; }
  constructor(player: string, key: LGK, key_code: string) {
    super();

    this._player = player;
    this._key = key;
    this._key_code = key_code;
  }
}
