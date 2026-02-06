import { StageGroup as SG } from "@/LF2/defines/StageGroup";
import { CheatType, IStageInfo } from "../../defines";
import { Defines } from "../../defines/defines";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";

export class StageSwitcher extends UIComponent {
  static override readonly TAG = 'StageSwitcher'

  private _stage: IStageInfo = Defines.VOID_STAGE;
  private _text_loader = new UITextLoader(() => this.node)
    .ignore_out_of_date();
  get show_all(): boolean {
    return this.lf2.is_cheat(CheatType.GIM_INK);
  }
  get stages(): IStageInfo[] {
    const cheat_0 = this.lf2.is_cheat(CheatType.LF2_NET);
    const cheat_1 = this.lf2.is_cheat(CheatType.GIM_INK);
    const all = this.lf2.datas.stages;
    if (cheat_0 && cheat_1) return all
    const ret = all.filter(v => {
      if (!cheat_0 && v.group?.some(v => v == SG.Hidden))
        return false;
      if (!cheat_1 && v.group?.some(v => v == SG.Dev))
        return false;
      if (!cheat_1 && !v.is_starting)
        return false
      return true
    })
    return ret.length ? ret : all;
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
    this._text_loader.set_text([this.text])
  }
}
