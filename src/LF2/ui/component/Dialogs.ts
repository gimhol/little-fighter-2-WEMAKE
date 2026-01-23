import { Ditto, UIImgLoader, UINode, UITextLoader } from "@/LF2";
import { IDialogInfo } from "@/LF2/defines/IDialogInfo";
import { StageDialogListener } from "./StageDialogListener";
import { UIComponent } from "./UIComponent";

export class Dialogs extends UIComponent {
  static override readonly TAG: string = 'Dialogs';
  protected _listner = new StageDialogListener(this, (d) => this.set_dialog(d));
  protected _text_node?: UINode;
  protected _text_loader = new UITextLoader(() => this._text_node)
  protected _talker_node?: UINode;
  protected _talker_loader = new UITextLoader(() => this._talker_node)
  protected _head_node?: UINode;
  protected _head_loader = new UIImgLoader(() => this._head_node)

  private _dialog: IDialogInfo | undefined;
  override on_start(): void {
    super.on_start?.();
    this._listner.start();
  }
  override on_stop(): void {
    this._listner.stop();
  }
  set_dialog(dialog: IDialogInfo | undefined) {
    if (!dialog) {
      this._text_loader.set_text([' ']).catch(e => Ditto.warn('' + e))
      this._talker_loader.set_text([' ']).catch(e => Ditto.warn('' + e))
      this._head_loader.set_img([], -1).catch(e => Ditto.warn('' + e))
      return;
    }
    const text = this.lf2.string(dialog.i18n)
    this._text_loader.set_text([text]).catch(e => Ditto.warn('' + e))

    const fighter = dialog.fighter ? this.lf2.datas.find_character(dialog.fighter) : void 0
    if (fighter) {
      const fighter_name = this.lf2.string(fighter.base.name)
      this._talker_loader.set_text([fighter_name]).catch(e => Ditto.warn('' + e))
    } else {
      this._talker_loader.set_text([' ']).catch(e => Ditto.warn('' + e))
    }

    if (fighter?.base.head) {
      this._head_loader.set_img([fighter.base.head]).catch(e => Ditto.warn('' + e))
    } else {
      this._head_loader.set_img([], -1).catch(e => Ditto.warn('' + e))
    }
  }
}