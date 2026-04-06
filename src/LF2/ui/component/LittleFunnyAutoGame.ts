import { new_team } from "@/LF2/base";
import { Defines, type IEntityData } from "@/LF2/defines";
import { IEntityCallbacks } from "@/LF2/entity";
import { Ticker } from "@/LF2/Ticker";
import { UIComponent } from "./UIComponent";

export class LittleFunnyAutoGame extends UIComponent {
  static override TAG: string = 'LittleFunnyAutoGame'
  private _datas: IEntityData[] = [];
  private _lr: number = 0;
  private _fighter_cbs: IEntityCallbacks = {
    on_dead: (e) => {
      e.callbacks.del(this._fighter_cbs);
      if (this.stopped || this.paused) return;
      this.add_fighter()
    }
  }
  private _ticker: Ticker | null = null;

  override on_resume(): void {
    super.on_resume?.()
    this._lr = 0;
    this.world.transform.scale_to(0.5, 0.5, 0.5)
    this.world.paused = false;
    this.lf2.change_bg(Defines.VOID_BG)
    this._ticker = this.world.ticker().set_range(0, 180).set_lifes(1)
    this._ticker.callbacks.add({
      end: (t) => {
        this.add_fighter();
        this.add_fighter();
        t.release();
      }
    })
  }

  override on_pause(): void {
    super.on_pause?.();
    this.world.clear();
    this._ticker?.release();
  }

  add_fighter() {
    if (!this._datas.length)
      this._datas.push(...this.lf2.datas.fighters)
    const data = this.lf2.mt.take(this._datas)
    if (!data) return;
    const fighter = this.lf2.factory.create_entity(this.world, data)
    if (!fighter) return;
    fighter.ctrl = this.lf2.factory.create_ctrl(data.id, '', fighter);
    fighter.team = new_team();
    fighter.set_position_x(this._lr * this.world.bg.width)
    fighter.facing = this._lr ? -1 : 1;
    fighter.callbacks.add(this._fighter_cbs)
    fighter.hp = fighter.hp_r = fighter.hp_max = 150;
    fighter.has_stat_bar = true;
    fighter.key_role = true;
    fighter.dead_gone = true;
    fighter.attach()
    fighter.enter_frame({ id: "running_0" })
    this._lr = (this._lr + 1) % 2
  }
}