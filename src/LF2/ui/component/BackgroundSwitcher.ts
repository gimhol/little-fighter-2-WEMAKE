import { IBgData, Defines } from "../../defines";
import { Label } from "./Label";

export class BackgroundSwitcher extends Label {
  static override readonly TAG = 'BackgroundSwitcher'
  private _background: IBgData = Defines.RANDOM_BG;
  get backgrounds(): IBgData[] {
    const ret = this.lf2.datas.backgrounds?.filter((v) => v.id !== Defines.VOID_BG.id) || []
    ret.unshift(Defines.RANDOM_BG)
    return ret;
  }
  get background(): IBgData {
    return this._background;
  }
  override on_resume(): void {
    super.on_resume();
    this.set_text(this._background.base.name)
    this.lf2.callbacks.add(this)
  }
  override on_pause(): void {
    super.on_pause();
    this.lf2.callbacks.del(this);
  }
  override on_show(): void {
    if (this._background === Defines.VOID_BG) this.on_broadcast();
  }
  on_broadcast(v: string = Defines.BuiltIn_Broadcast.SwitchBackground) {
    if (v !== Defines.BuiltIn_Broadcast.SwitchBackground) return;
    const { backgrounds } = this;
    if (!backgrounds.length) {
      this._background = Defines.VOID_BG;
      this.world.stage.change_bg(Defines.VOID_BG);
    } else {
      const background_id = this.background.id;
      const curr_idx = backgrounds.findIndex((v) => v.id === background_id)
      const next_idx = (curr_idx + 1) % backgrounds.length;
      this._background = backgrounds[next_idx]!;
      this.world.stage.change_bg(this._background)
    }
    this.set_text(this._background.base.name)
  }
}
