import { KeyStatus } from "../../controller/KeyStatus";
import { GameKey } from "../../defines";
import { Entity } from "../../entity";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { UIComponent } from "./UIComponent";
/**
 * 按键的相机控制
 *
 * @export
 * @class CameraCtrl
 * @extends {UIComponent}
 */
export class CameraCtrl extends UIComponent {
  static override readonly TAG = 'CameraCtrl';
  time: number = 0;
  free: boolean = true;
  _staring?: Entity;
  get staring(): Entity | undefined { return this._staring; }
  set staring(v: Entity | undefined) { this._staring = v; };
  readonly keys: Record<GameKey, KeyStatus> = {
    [GameKey.L]: new KeyStatus(this),
    [GameKey.R]: new KeyStatus(this),
    [GameKey.U]: new KeyStatus(this),
    [GameKey.D]: new KeyStatus(this),
    [GameKey.a]: new KeyStatus(this),
    [GameKey.j]: new KeyStatus(this),
    [GameKey.d]: new KeyStatus(this)
  };
  get lr() {
    const r = this.keys.R.is_end() ? 0 : 1;
    const l = this.keys.L.is_end() ? 0 : 1;
    return r - l;
  }
  override on_key_down(e: IUIKeyEvent): void {
    this.keys[e.game_key].hit();
  }
  override on_key_up(e: IUIKeyEvent): void {
    this.keys[e.game_key].end();
  }
  override update(dt: number): void {
    const { lr } = this;
    if (lr) {
      this.free = false
      const cam_x = this.world.renderer.cam_x;
      this.world.lock_cam_x = cam_x + 10 * dt * lr;
    } else if (!this.keys.j.is_end()) {
      this.free = false
      const cam_x = this.world.renderer.cam_x;
      this.world.lock_cam_x = cam_x;
    } else if (!this.keys.d.is_end()) {
      this.world.lock_cam_x = void 0;
      this.free = true
    } else if (this.keys.U.is_start()) {
      this.keys.U.use()
      const fighters = this.lf2.characters.list()
      const idx = fighters.indexOf(this.staring!)
      const len = fighters.length
      this.staring = fighters[(idx + len - 1) % len]
      this.free = !!this.staring;
    } else if (this.keys.D.is_start()) {
      this.keys.D.use()
      const fighters = this.lf2.characters.list()
      const idx = fighters.indexOf(this.staring!)
      const len = fighters.length
      this.staring = fighters[(idx + 1) % len]
      this.free = !!this.staring;
    }
    if (this.staring?.is_attach === false)
      this._staring = void 0;
    if (this.free && this.staring)
      this.world.lock_cam_x = this.staring.position.x - this.world.screen_w / 2
    this.time += dt;
  }
}
