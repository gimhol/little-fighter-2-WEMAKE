import { IDialogInfo } from "@/LF2/defines/IDialogInfo";
import { IWorldCallbacks } from "@/LF2/IWorldCallbacks";
import { Stage } from "@/LF2/stage";
import IStageCallbacks from "@/LF2/stage/IStageCallbacks";
import { UIComponent } from "./UIComponent";

export class StageDialogListener {
  readonly owner: UIComponent;
  protected _handler?: (dialog?: IDialogInfo, prev?: IDialogInfo) => void;

  protected _stage?: Stage;
  protected _dialog?: IDialogInfo | undefined;
  protected readonly _world_cbs: IWorldCallbacks = { on_stage_change: c => this.set_stage(c), };
  protected readonly _stage_cbs: IStageCallbacks = { on_dialogs_changed: (_1, _2, s) => this.set_dialog(s.dialog) };

  get lf2() { return this.owner.lf2; }

  constructor(owner: UIComponent, handler?: (dialog?: IDialogInfo, prev?: IDialogInfo) => void) {
    this.owner = owner;
    this._handler = handler;
  }
  start(): void {
    this.set_stage(this.lf2.world.stage);
    this.lf2.world.callbacks.add(this._world_cbs);
  }
  stop(): void {
    this.lf2.world.callbacks.del(this._world_cbs);
    this._stage?.callbacks.del(this._stage_cbs);
  }
  set_handler(handler: (dialog: IDialogInfo | undefined) => void): this {
    this._handler = handler;
    return this;
  }
  protected set_stage(stage: Stage) {
    if (this._stage === stage) return;
    stage.callbacks.add(this._stage_cbs);
    this._stage?.callbacks.del(this._stage_cbs);
    this._stage = stage;
    this.set_dialog(stage.dialog);
  }
  protected set_dialog(dialog: IDialogInfo | undefined) {
    console.log('dialog', dialog)
    if (this._dialog == dialog) return;
    const prev = this._dialog;
    this._handler?.(this._dialog = dialog, prev);
  }
}
