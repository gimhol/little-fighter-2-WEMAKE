import type { IStagePhaseInfo } from "@/LF2/defines";
import type { IWorldCallbacks } from "@/LF2/IWorldCallbacks";
import type IStageCallbacks from "@/LF2/stage/IStageCallbacks";
import { Stage } from "../../stage";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";

export class StageTitleText extends UIComponent {
  static override readonly TAG = "StageTitleText";
  private _title: string = '';
  private _stage: Stage | null = null;
  private _text_loader = new UITextLoader(() => this.node).set_style({
    fill_style: "white",
    font: "12px Arial",
    line_width: 1,
    padding_t: 2
  }).ignore_out_of_date();

  private _world_cbs: IWorldCallbacks = {
    on_stage_change: (stage: Stage) => this.set_stage(stage)
  }
  private _stage_cbs: IStageCallbacks = {
    on_phase_changed: (_, phase) => this.set_phase(phase || null)
  }
  set_stage(stage: Stage | null) {
    if (this._stage == stage) return;
    this._stage?.callbacks.del(this._stage_cbs);
    stage?.callbacks.add(this._stage_cbs);
    this._stage = stage;
    this.set_phase(stage?.phase || null)
  }
  set_phase(phase: IStagePhaseInfo | null) {
    const title = this.lf2.string(phase?.title ?? this._stage?.title ?? '')
    this.set_title(title)
  }
  set_title(title: string) {
    if (this._title == title) return;
    this._title = title;
    this._text_loader.set_text([title]);
  }
  override on_start(): void {
    super.on_start?.();
    this._title = '';
    this.world.callbacks.add(this._world_cbs)
    this.set_stage(this.world.stage)
  }
  override on_stop(): void {
    this.world.callbacks.del(this._world_cbs)
    this.set_stage(null)
  }
}
