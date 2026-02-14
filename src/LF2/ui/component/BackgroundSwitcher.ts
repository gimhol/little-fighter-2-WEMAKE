import { IBgData } from "../../defines";
import { Defines } from "../../defines/defines";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";


export class BackgroundSwitcher extends UIComponent {
  static override readonly TAG = 'BackgroundSwitcher'
  private _background: IBgData = Defines.RANDOM_BG;
  private _text_loader = new UITextLoader(() => this.node)
    .ignore_out_of_date();

  get backgrounds(): IBgData[] {
    const ret = this.lf2.datas.backgrounds?.filter((v) => v.id !== Defines.VOID_BG.id) || []
    ret.unshift(Defines.RANDOM_BG)
    return ret;
  }
  get background(): IBgData {
    return this._background;
  }
  get text(): string {
    return this._background.base.name;
  }
  override on_resume(): void {
    super.on_resume();
    this.update_text();
    this.lf2.callbacks.add(this)
  }
  override on_pause(): void {
    super.on_pause();
    this.lf2.callbacks.del(this);
  }
  override on_show(): void {
    if (this._background === Defines.VOID_BG) this.on_broadcast();
  }
  update_text() {
    this._text_loader.set_text([this.text])
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
    this.update_text()
  }
}
