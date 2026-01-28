import { new_team } from "@/LF2/base";
import { Defines, type IEntityData } from "@/LF2/defines";
import { Entity, Factory, IEntityCallbacks } from "@/LF2/entity";
import { UIComponent } from "./UIComponent";

export class LittleFunnyAutoGame extends UIComponent {
  static override TAG: string = 'LittleFunnyAutoGame'
  private _datas: IEntityData[] = [];
  private _lr: number = 0;
  private _fighters = new Set<Entity>()
  private _team: number = 0;
  private _fighter_cbs: IEntityCallbacks = {
    on_disposed: (e) => {
      e.callbacks.del(this._fighter_cbs);
      this._fighters.delete(e);
      this.add_fighter()
    },
  }
  override on_resume(): void {
    super.on_resume?.()
    this._lr = 0;
    this.world.transform.scale_to(0.5, 0.5, 0.5)
    this.lf2.change_bg(Defines.VOID_BG)
    this.add_fighter();
    this.add_fighter();
  }

  add_fighter() {
    if (!this._datas.length)
      this._datas.push(...this.lf2.datas.fighters)
    const data = this.lf2.mt.take(this._datas)
    if (!data) return;
    const fighter = Factory.inst.create_entity(data.type, this.world, data)
    if (!fighter) return;
    fighter.ctrl = Factory.inst.create_ctrl(data.id, '', fighter);
    fighter.team = '' + (this._team + 1);
    fighter.set_position_x(this._lr * this.world.bg.width)
    fighter.facing = this._lr ? -1 : 1;
    this._fighters.add(fighter)
    fighter.callbacks.add(this._fighter_cbs)
    fighter.hp = fighter.hp_r = fighter.hp_max = 150;
    fighter.has_stat_bar = true;
    fighter.key_role = true;
    fighter.dead_gone = true;
    fighter.attach()
    fighter.enter_frame({ id: "running_0" })
    this._lr = (this._lr + 1) % 2
    this._team = (this._team + 1) % 4
  }
  override on_pause(): void {
    super.on_pause?.();
    this.world.transform.scale_to(1, 1, 1, false)
    for (const f of this._fighters) {
      f.callbacks.del(this._fighter_cbs);
      this.world.del_entity(f);
    }
  }
}