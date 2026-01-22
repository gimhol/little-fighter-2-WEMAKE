import { IWorldCallbacks } from "@/LF2/IWorldCallbacks";
import { IDialogInfo } from "@/LF2/defines/IDialogInfo";
import IStageCallbacks from "@/LF2/stage/IStageCallbacks";
import { Stage } from "@/LF2/stage/Stage";
import { UIComponent } from "./UIComponent";
import { Ditto, UIImgLoader, UINode, UITextLoader } from "@/LF2";

export class Dialogs extends UIComponent {
  static override readonly TAG: string = 'Dialogs';
  protected _stage?: Stage;
  protected _text_node?: UINode;
  protected _text_loader = new UITextLoader(() => this._text_node)
  protected _speaker_node?: UINode;
  protected _speaker_loader = new UITextLoader(() => this._speaker_node)
  protected _protrait_node?: UINode;
  protected _protrait_loader = new UIImgLoader(() => this._protrait_node)
  protected readonly _world_cbs: IWorldCallbacks = {
    on_stage_change: c => this.set_stage(c),
  }
  protected readonly _stage_cbs: IStageCallbacks = {
    on_dialogs_changed: (_1, _2, s) => this.set_dialog(s.dialog),
  }
  private _dialog: IDialogInfo | undefined;
  override on_start(): void {
    super.on_start?.();
    this.set_stage(this.lf2.world.stage);
    this.lf2.world.callbacks.add(this._world_cbs)
  }
  override on_stop(): void {
    this.lf2.world.callbacks.del(this._world_cbs)
    this._stage?.callbacks.del(this._stage_cbs)
  }
  set_stage(stage: Stage) {
    if (this._stage === stage) return;
    stage.callbacks.add(this._stage_cbs)
    this._stage?.callbacks.del(this._stage_cbs)
    this._stage = stage;
    this.set_dialog(stage.dialog)
  }
  set_dialog(dialog: IDialogInfo | undefined) {
    if (this._dialog == dialog) return;
    this._dialog = dialog;

    if (!dialog) {
      this._text_loader.set_text([' ']).catch(e => Ditto.warn('' + e))
      this._speaker_loader.set_text([' ']).catch(e => Ditto.warn('' + e))
      this._protrait_loader.set_img([], -1).catch(e => Ditto.warn('' + e))
      return;
    }

    const text = this.lf2.string(dialog.i18n)
    this._text_loader.set_text([text]).catch(e => Ditto.warn('' + e))


    const fighter = dialog.fighter ? this.lf2.datas.find_character(dialog.fighter) : void 0
    if (fighter) {
      const fighter_name = this.lf2.string(fighter.base.name)
      this._speaker_loader.set_text([fighter_name]).catch(e => Ditto.warn('' + e))
    }
  }
}