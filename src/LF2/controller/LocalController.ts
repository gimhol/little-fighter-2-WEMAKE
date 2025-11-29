import { GameKey as GK } from "../defines/GameKey";
import { IKeyboardCallback } from "../ditto/keyboard/IKeyboardCallback";
import { IKeyEvent } from "../ditto/keyboard/IKeyEvent";
import { Entity } from "../entity/Entity";
import { PlayerInfo } from "../PlayerInfo";
import { abs } from "../utils";
import { BaseController } from "./BaseController";
import { ControllerUpdateResult } from "./ControllerUpdateResult";
import { CtrlDevice } from "../defines/CtrlDevice";

type TKeyCodeMap = { [x in GK]?: string };
type TCodeKeyMap = { [x in string]?: GK };
export class LocalController
  extends BaseController
  implements IKeyboardCallback {
  readonly __is_local_ctrl__ = true;
  readonly player: PlayerInfo;

  private _key_code_map: TKeyCodeMap = {};
  private _code_key_map: TCodeKeyMap = {};
  private _ax_using: number = 0;
  private _ay_using: number = 0;
  on_key_up(e: IKeyEvent) {
    const code = e.key?.toLowerCase();
    if (!code) return;
    const key = this._code_key_map[code];
    if (!key) return;
    this.end(key);
  }

  on_key_down(e: IKeyEvent) {
    const code = e.key?.toLowerCase();
    if (!code) return;
    const key = this._code_key_map[code];
    if (!key) return;
    this.start(key);
  }

  constructor(player_id: string, entity: Entity, kc?: TKeyCodeMap) {
    super(player_id, entity);
    this.player = this.lf2.ensure_player(player_id)
    if (kc) this.set_key_code_map(kc);
    this.disposer = entity.world.lf2.keyboard.callback.add(this);
  }

  set_key_code_map(key_code_map: TKeyCodeMap) {
    this._key_code_map = {};
    this._code_key_map = {};
    for (const key of Object.keys(key_code_map) as GK[]) {
      const code = key_code_map[key]?.toLowerCase();
      if (!code) continue;
      this._key_code_map[key] = code;
      this._code_key_map[code] = key;
    }
  }

  override update(): ControllerUpdateResult {
    if (this.player && this.player.ctrl !== CtrlDevice.Keyboard) {
      const [ax = 0, ay = 0] = this.lf2.keyboard.axes(this.player.ctrl - 1)

      if (ax > 0.22) {
        this._ax_using = 1
        this.is_end(GK.R) && this.start(GK.R)
        this.is_end(GK.L) || this.end(GK.L)
      } else if (ax < -0.22) {
        this._ax_using = 1
        this.is_end(GK.L) && this.start(GK.L)
        this.is_end(GK.R) || this.end(GK.R)
      } else if (abs(ax) < 0.12 && this._ax_using) {
        this._ax_using = 0
        this.is_end(GK.L) || this.end(GK.L)
        this.is_end(GK.R) || this.end(GK.R)
      }
      if (ay > 0.22) {
        this._ay_using = 1
        this.is_end(GK.D) && this.start(GK.D)
        this.is_end(GK.U) || this.end(GK.U)
      } else if (ay < -0.22) {
        this._ay_using = 1
        this.is_end(GK.U) && this.start(GK.U)
        this.is_end(GK.D) || this.end(GK.D)
      } else if (abs(ay) < 0.12 && this._ay_using) {
        this._ay_using = 0
        this.is_end(GK.U) || this.end(GK.U)
        this.is_end(GK.D) || this.end(GK.D)
      }
    }
    return super.update()
  }
}
export default LocalController;
