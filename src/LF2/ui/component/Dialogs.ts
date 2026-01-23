import { Ditto, UIImgLoader, UINode, UITextLoader } from "@/LF2";
import { IDialogInfo } from "@/LF2/defines/IDialogInfo";
import { StageDialogListener } from "./StageDialogListener";
import { UIComponent } from "./UIComponent";
import { Transform } from "@/LF2/Transform";

export class Dialogs extends UIComponent {
  static override readonly TAG: string = 'Dialogs';
  protected _listner = new StageDialogListener(this, (d) => this.set_dialog(d));
  protected _text_node?: UINode;
  protected _text_loader = new UITextLoader(() => this._text_node)
  protected _talker_node?: UINode;
  protected _talker_loader = new UITextLoader(() => this._talker_node)
  protected _head_node?: UINode;
  protected _head_loader = new UIImgLoader(() => this._head_node)
  protected _transform = new Transform()

  override on_start(): void {
    super.on_start?.();
    const head_node_id = this.props.str('head_node_id')
    const text_node_id = this.props.str('text_node_id')
    const talker_node_id = this.props.str('talker_node_id')
    if (head_node_id) this._head_node = this.node.search_child(head_node_id)
    if (text_node_id) this._text_node = this.node.search_child(text_node_id)
    if (talker_node_id) this._talker_node = this.node.search_child(talker_node_id)
    this._listner.start();
  }

  override on_stop(): void {
    this._listner.stop();
  }
  hide_dialog() {
    this._transform.scale_to(0, 0, 1, true)
    this.node.visible = false;
    this._text_loader.set_text([' ']).catch(e => Ditto.warn('' + e))
    this._talker_loader.set_text([' ']).catch(e => Ditto.warn('' + e))
    this._head_loader.set_img([], -1).catch(e => Ditto.warn('' + e))
  }
  show_dialog(dialog: IDialogInfo) {
    this._transform.scale_to(1, 1, 1, true)
    this.node.visible = true;
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
  override update(dt: number): void {
    this._transform.update();
    this.node.scale.value = [
      this._transform.scale_x,
      this._transform.scale_y,
      this._transform.scale_z,
    ]
  }
  set_dialog(dialog: IDialogInfo | undefined) {
    if (dialog) {
      this.show_dialog(dialog);
    } else {
      this.hide_dialog()
    }
    this.world.transform.move_to(0, dialog ? 120 : 0, 0, true)
  }
}