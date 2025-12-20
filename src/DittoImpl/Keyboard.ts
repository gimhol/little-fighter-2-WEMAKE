import Callbacks from "../LF2/base/Callbacks";
import { NoEmitCallbacks } from "../LF2/base/NoEmitCallbacks";
import { IKeyboard } from "../LF2/ditto/keyboard/IKeyboard";
import { IKeyboardCallback } from "../LF2/ditto/keyboard/IKeyboardCallback";
import { IKeyEvent } from "../LF2/ditto/keyboard/IKeyEvent";
import { LF2 } from "../LF2/LF2";

class __KeyEvent implements IKeyEvent {
  readonly times: number;
  readonly key: string;
  readonly native: KeyboardEvent | undefined;;
  constructor(key: string, times: number = 0, e: KeyboardEvent | undefined = void 0) {
    this.key = key;
    this.times = times;
    this.native = e;

  }
  stopImmediatePropagation = () => this.native?.stopImmediatePropagation();
  stopPropagation = () => this.native?.stopPropagation();
  preventDefault = () => this.native?.preventDefault();
  interrupt = () => {
    this.stopImmediatePropagation()
    this.stopPropagation()
    this.preventDefault()
  }
}

export class __Keyboard implements IKeyboard {
  static TAG = '__Keyboard';
  protected _callback = new Callbacks<IKeyboardCallback>();
  protected _times_map = new Map<string, number>();
  protected lf2: LF2;
  get callback(): NoEmitCallbacks<IKeyboardCallback> {
    return this._callback;
  }
  protected _on_key_down = (e: KeyboardEvent) => {
    const key_code = e.key?.toLowerCase() || "";
    this.key_down(key_code, e)
  };

  protected _on_key_up = (e: KeyboardEvent) => {
    const key_code = e.key?.toLowerCase() || "";
    this.key_up(key_code, e)
  };
  protected key_down = (key_code: string, e?: KeyboardEvent) => {
    const times = this._times_map.get(key_code) ?? -1;
    this._times_map.set(key_code, times + 1);
    this._callback.emit("on_key_down")(new __KeyEvent(key_code, times + 1, e));
  };
  protected key_up = (key_code: string, e?: KeyboardEvent) => {
    this._times_map.delete(key_code);
    this._callback.emit("on_key_up")(new __KeyEvent(key_code, 0, e));
  };
  protected gamepads: (Gamepad | null)[] = [];
  protected gamepad_timer?: ReturnType<typeof setInterval>;
  protected gamepad_buttons = new Map<string, boolean>();
  constructor(lf2: LF2) {
    this.lf2 = lf2;
    window.addEventListener("keydown", this._on_key_down);
    window.addEventListener("keyup", this._on_key_up);
    this.gamepad_timer = setInterval(this.scan_gamepad_buttons.bind(this), 100 / 6)
  }

  protected scan_gamepad_buttons() {
    const gamepads = this.gamepads = navigator.getGamepads()
    for (const gamepad of gamepads) {
      if (!gamepad) continue;
      const type = gamepad.mapping === "standard" ? 'standard' : '';
      const { buttons, index } = gamepad;
      for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        const known_key_name = gamepad_key_map[type]?.[i]
        const key_name = known_key_name || 'Button ' + i
        const key_code = `${index + 1}: ${key_name}`;
        const pressed = btn.pressed || btn.touched || btn.value >= 0.3;
        const old_status = !!this.gamepad_buttons.get(key_code);
        if (old_status === pressed) continue;
        this.gamepad_buttons.set(key_code, pressed);
        if (pressed) this.key_down(key_code);
        else this.key_up(key_code);
        if (pressed) continue;

        if (type === 'standard') {
          switch (known_key_name) {
            case 'Start':
              this.lf2.world.paused = !this.lf2.world.paused;
              break;
            case 'Back':
              this.lf2.pop_ui_safe()
              break;
          }
        }
      }
    }
  }

  is_key_down(key_code: string): boolean {
    return this._times_map.get(key_code) !== void 0
  }

  axes(index: number): readonly number[] {
    return this.gamepads[index]?.axes || []
  }

  dispose() {
    window.removeEventListener("keydown", this._on_key_down);
    window.removeEventListener("keyup", this._on_key_up);
    this._callback.clear()
    clearInterval(this.gamepad_timer)
  }
}

const gamepad_key_map: { [x in string]?: { [x in number]?: string } } = {
  standard: {
    0: 'A',
    1: 'B',
    2: 'X',
    3: 'Y',
    4: 'LB',
    5: 'RB',
    6: 'LT',
    7: 'RT',
    8: 'Back',
    9: 'Start',
    10: 'LS',
    11: 'RS',
    12: 'Up',
    13: 'Down',
    14: 'Left',
    15: 'Right',
  }
}