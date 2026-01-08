import { CheatType, IStageInfo } from "../../defines";
import { Defines } from "../../defines/defines";
import { ui_load_txt } from "../ui_load_txt";
import { UIComponent } from "./UIComponent";

export class StageNameText extends UIComponent {
  static override readonly TAG = 'StageNameText'

  private _stage: IStageInfo = Defines.VOID_STAGE;
  get show_all(): boolean {
    return this.lf2.is_cheat(CheatType.GIM_INK);
  }
  get stages(): IStageInfo[] {
    const ret =
      this.lf2.stages?.filter((v) => v.id !== Defines.VOID_STAGE.id) || [];
    if (this.show_all) return ret;
    return ret.filter((v) => v.is_starting);
  }
  get stage(): IStageInfo {
    return this._stage;
  }
  get text(): string {
    if (this.show_all) return this._stage.name;
    return this._stage.starting_name ?? this._stage.name;
  }
  override on_resume(): void {
    super.on_resume();
    this.lf2.callbacks.add(this)
  }
  override on_pause(): void {
    super.on_pause();
    this.lf2.callbacks.del(this);
  }
  override on_show(): void {
    if (this._stage === Defines.VOID_STAGE) this.on_broadcast();
  }
  on_broadcast(v: string = Defines.BuiltIn_Broadcast.SwitchStage) {
    if (v !== Defines.BuiltIn_Broadcast.SwitchStage) return
    const { stages } = this;
    if (!stages.length) {
      this._stage = Defines.VOID_STAGE;
      this.world.stage.change_bg(Defines.VOID_BG)
    } else {
      const state_id = this.stage.id;
      const curr_idx = stages.findIndex((v) => v.id === state_id);
      const next_idx = (curr_idx + 1) % stages.length;
      this._stage = stages[next_idx]!;
      const bdt = this.world.lf2.datas.backgrounds.find(v => v.id === this._stage.bg);
      this.world.stage.change_bg(bdt ?? Defines.VOID_BG)
    }

    ui_load_txt(this.lf2, {
      i18n: this.text, style: {
        fill_style: "#9b9bff",
        font: "15px Arial",
      }
    }).then(v => {
      this.node.txts.value = v;
      this.node.txt_idx.value = 0;
      const { w, h, scale } = v[0]!
      this.node.size.value = [w / scale, h / scale];
    })
  }
}
