import { CtrlDevice } from "../defines/CtrlDevice";
import { GameKey as GK } from "../defines/GameKey";
import { Entity } from "../entity/Entity";
import { PlayerInfo } from "../PlayerInfo";
import { LF2KeyEvent } from "../ui/LF2KeyEvent";
import { abs, between } from "../utils";
import { BaseController } from "./BaseController";
import { ControllerUpdateResult } from "./ControllerUpdateResult";

type TKeyCodeMap = { [x in GK]?: string };
type TCodeKeyMap = { [x in string]?: GK };
export class LocalController
  extends BaseController {
  readonly __is_local_ctrl__ = true;
  readonly player: PlayerInfo;
  private _ax_using: number = 0;
  private _ay_using: number = 0;
  on_key_up(e: LF2KeyEvent) {
    this.end(e.game_key);
  }
  on_key_down(e: LF2KeyEvent) {
    this.start(e.game_key);
  }

  constructor(player_id: string, entity: Entity) {
    super(player_id, entity);
    this.player = this.lf2.ensure_player(player_id)
  }

  override update(): ControllerUpdateResult {
    if (this.player && between(this.player.ctrl, CtrlDevice.MAX_GAME_PAD, CtrlDevice.MAX_GAME_PAD)) {
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
