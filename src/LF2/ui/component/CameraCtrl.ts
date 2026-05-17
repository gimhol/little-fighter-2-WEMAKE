import { CMD } from "../../defines/CMD";
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
  static override readonly TAGS: string[] = ["CameraCtrl"];
  time: number = 0;
  free: boolean = true;
  staring?: Entity;
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
  focus_next(d: -1 | 1) {
    const fighters = this.lf2.fighters.all.filter(v => v.hp > 0)
    fighters.sort((a, b) => a.position.x - b.position.x);
    if (!this.staring) {
      this.staring = fighters.at(d < 0 ? fighters.length - 1 : 0)
    } else {
      const idx = fighters.indexOf(this.staring!)
      const len = fighters.length
      this.staring = fighters.at((idx + len + d) % len)
    }
    this.free = !!this.staring;
  }
  override update(dt: number): void {
    const { lr } = this;
    if (lr) {
      this.free = false
      const { cam_x } = this.world.renderer;
      this.lf2.cmds.push(CMD.DIST_CAM, `${cam_x + 10 * dt * lr}`)
    } else if (!this.keys.j.is_end()) {
      this.free = false
      const { cam_x } = this.world.renderer;
      this.lf2.cmds.push(CMD.DIST_CAM, `${cam_x}`)
    }
    if (!this.keys.d.is_end()) {
      this.lf2.cmds.push(CMD.DIST_CAM, ``)
      this.staring = void 0;
      this.free = true
    }
    if (this.keys.U.is_start()) this.focus_next(-1);
    if (this.keys.D.is_start()) this.focus_next(1);
    if (this.staring && (this.staring.hp <= 0 || !this.staring.mounted))
      this.focus_next(1)

    if (this.free && this.staring) {
      const cam_x = this.staring.position.x - this.world.screen_w / 2
      this.lf2.cmds.push(CMD.DIST_CAM, `${cam_x}`)
    }
    this.time += dt;
  }
}
