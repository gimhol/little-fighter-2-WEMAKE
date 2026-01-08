import { abs } from "@/LF2/utils/math/base";
import Callbacks from "../LF2/base/Callbacks";
import { NoEmitCallbacks } from "../LF2/base/NoEmitCallbacks";
import { IKeyboard } from "../LF2/ditto/keyboard/IKeyboard";
import { IKeyboardCallback } from "../LF2/ditto/keyboard/IKeyboardCallback";
import { IKeyEvent } from "../LF2/ditto/keyboard/IKeyEvent";
import { LF2 } from "../LF2/LF2";
import { CMD } from "@/LF2/defines/CMD";

class __KeyEvent implements IKeyEvent {
  readonly times: number;
  readonly key: string;
  readonly native: KeyboardEvent | undefined;
  readonly pressed: boolean;
  constructor(
    key: string,
    pressed: boolean,
    times: number = 0,
    e: KeyboardEvent | undefined = void 0
  ) {
    this.key = key;
    this.pressed = pressed;
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
  protected _axe_dead_zone = 0.12;
  protected _axe_live_zone = 0.22;
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
    this._callback.emit("on_key_down")(new __KeyEvent(key_code, true, times + 1, e));
  };
  protected key_up = (key_code: string, e?: KeyboardEvent) => {
    this._times_map.delete(key_code);
    this._callback.emit("on_key_up")(new __KeyEvent(key_code, false, 0, e));
  };
  protected gamepads: (Gamepad | null)[] = [];
  protected gamepad_timer?: ReturnType<typeof setInterval>;
  protected gamepad_buttons = new Map<string, boolean>();
  protected gamepad_axes: (readonly number[])[] = []

  constructor(lf2: LF2) {
    this.lf2 = lf2;
    window.addEventListener("keydown", this._on_key_down);
    window.addEventListener("keyup", this._on_key_up);
    this.gamepad_timer = setInterval(this.scan_gamepad_buttons.bind(this), 1000 / 60)
  }
  protected scan_gamepad_buttons() {
    const gamepads = this.gamepads = navigator.getGamepads()
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (!gamepad) continue;
      const type = gamepad.mapping
      if (type !== 'standard') { debugger; continue; }

      const { buttons, index } = gamepad;
      for (let i = 0; i < buttons.length; i++) {
        if (i < GPBtnCode.__MIN) continue;
        if (i > GPBtnCode.__MAX) break;
        const btn = buttons[i];
        const btn_code = i as GPBtnCode
        const pressed = btn.pressed || btn.touched || btn.value >= 0.3;
        const changed = this.update_gp_btn(index, btn_code, pressed)
        if (!changed) continue;
        if (!pressed) continue;
        switch (btn_code) {
          case GPBtnCode.Start: this.lf2.cmds.push(CMD.F1); break;
          case GPBtnCode.Back: this.lf2.cmds.push(CMD.F4); break;
        }
      }
      const [ax, ay] = gamepad.axes;
      const [pax, pay] = this.gamepad_axes[i]
      const alz = this._axe_live_zone;
      const adz = this._axe_dead_zone;
      if (ax >= alz && pax < alz) {
        this.update_gp_btn(index, GPBtnCode.Right, true)
      } else if (ax <= -alz && pax > alz) {
        this.update_gp_btn(index, GPBtnCode.Left, true)
      } else if (abs(ax) < adz && abs(pax) > adz) {
        this.update_gp_btn(index, GPBtnCode.Right, false)
        this.update_gp_btn(index, GPBtnCode.Left, false)
      }
      if (ay >= alz && pay < alz) {
        this.update_gp_btn(index, GPBtnCode.Down, true)
      } else if (ay <= -alz && pay > alz) {
        this.update_gp_btn(index, GPBtnCode.Up, true)
      } else if (abs(ay) < adz && abs(pay) > adz) {
        this.update_gp_btn(index, GPBtnCode.Down, false)
        this.update_gp_btn(index, GPBtnCode.Up, false)
      }
      this.gamepad_axes[i] = [ax, ay]
    }
  }
  update_gp_btn(index: number, key: GPBtnCode, pressed: boolean): boolean {
    const btn_name = GPBtnName[key]
    const key_code = `${index + 1}: ${btn_name}`;
    if (this.gamepad_buttons.get(key_code) === pressed) return false;
    this.gamepad_buttons.set(key_code, pressed);
    pressed ? this.key_down(key_code) : this.key_up(key_code);
    return true;
  }
  dispose() {
    window.removeEventListener("keydown", this._on_key_down);
    window.removeEventListener("keyup", this._on_key_up);
    this._callback.clear()
    clearInterval(this.gamepad_timer)
  }
}

enum GPBtnCode {
  __MIN = 0,
  A = 0,
  B = 1,
  X = 2,
  Y = 3,
  LB = 4,
  RB = 5,
  LT = 6,
  RT = 7,
  Back = 8,
  Start = 9,
  LS = 10,
  RS = 11,
  Up = 12,
  Down = 13,
  Left = 14,
  Right = 15,
  __MAX = 15
}
const GPBtnName: Record<GPBtnCode, string> = {
  [GPBtnCode.A]: 'A',
  [GPBtnCode.B]: 'B',
  [GPBtnCode.X]: 'X',
  [GPBtnCode.Y]: 'Y',
  [GPBtnCode.LB]: 'LB',
  [GPBtnCode.RB]: 'RB',
  [GPBtnCode.LT]: 'LT',
  [GPBtnCode.RT]: 'RT',
  [GPBtnCode.Back]: 'Back',
  [GPBtnCode.Start]: 'Start',
  [GPBtnCode.LS]: 'LS',
  [GPBtnCode.RS]: 'RS',
  [GPBtnCode.Up]: 'Up',
  [GPBtnCode.Down]: 'Down',
  [GPBtnCode.Left]: 'Left',
  [GPBtnCode.Right]: 'Right',
}