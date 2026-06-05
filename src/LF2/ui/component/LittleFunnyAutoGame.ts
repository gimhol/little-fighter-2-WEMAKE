import { ActionDirector, OID, TeamEnum } from "@/LF2";
import { CMD, type IEntityData } from "@/LF2/defines";
import { IEntityCallbacks, is_fighter } from "@/LF2/entity";
import { StatBarType } from "@/LF2/entity/StatBarType";
import { UIComponent } from "./UIComponent";

export class LittleFunnyAutoGame extends UIComponent {
  static override TAGS: string[] = ["LittleFunnyAutoGame"];
  private _datas: IEntityData[] = [];
  private _lr: number = 0 | 1;
  private _fighter_cbs: IEntityCallbacks = {
    on_dead: (e) => {
      e.callbacks.del(this._fighter_cbs);
      if (this.stopped || this.paused) return;
      let allies_count = 0;
      let enemies_count = 0;
      for (const f of e.world.entities) {
        if (!is_fighter(f) || e == f) continue;
        if (f.team == e.team) allies_count += (e.data.base.ce ?? 1);
        else enemies_count += (e.data.base.ce ?? 1);
      }
      while (enemies_count > allies_count) {
        const f = this.add_random_fighter(this._lr = (this._lr + 1) % 2, e.team);
        if (!f) break;
        enemies_count += (f.data.base.ce ?? 1)
      }
    }
  }
  private _director = new ActionDirector().offset(5000, () => {
    this.add_random_fighter(0, '1');
    this.add_random_fighter(1, '2');
  })
  override update(dt: number): void {
    this._director.update(dt);
  }
  override on_resume(): void {
    super.on_resume?.()
    this._lr = 0;
    this.world.paused = false;
    this.lf2.change_bg('')
    this.lf2.cmds.push(CMD.LOCK_CAM, '0')
  }
  override on_pause(): void {
    super.on_pause?.();
    this.world.clear();
    this._ticker?.release();
    this._ticker = null
    this.lf2.cmds.push(CMD.LOCK_CAM, '')
  }
  add_random_fighter(lr: number, team: string) {
    if (!this._datas.length)
      this._datas.push(...this.lf2.datas.fighters)
    const data = this.lf2.mt.take(this._datas)
    if (!data) return;
    const fighter = this.lf2.factory.create_entity(this.world, data)
    if (!fighter) return;
    fighter.ctrl = this.lf2.factory.create_ctrl(data.id, '', fighter);
    fighter.team = team;
    fighter.set_position_x(lr * this.world.bg.width)
    fighter.facing = lr ? -1 : 1;
    fighter.callbacks.add(this._fighter_cbs)
    fighter.hp = fighter.hp_r = fighter.hp_max = 150 * (data.base.ce ?? 1);
    fighter.stat_bar_type = StatBarType.None;
    fighter.wakeup_invuln = true;
    fighter.blinking = 64
    fighter.dead_gone = true;
    fighter.name_visible = false;
    fighter.enter_frame({ id: "running_0" })
    fighter.attach()
    return fighter;
  }
}