import { IDialogInfo } from "@/LF2/defines/IDialogInfo";
import { Ditto } from "@/LF2/ditto/Instance";
import { Transform } from "@/LF2/Transform";
import { ISchemaMeta } from "@/LF2/utils/schema/make_schema";
import { UIImgLoader } from "../UIImgLoader";
import { UINode } from "../UINode";
import { Label } from "./Label";
import { StageDialogListener } from "./StageDialogListener";
import { UIComponent } from "./UIComponent";

export interface IDialogsProps {
  head_node?: UINode | null;
  text?: Label | null;
  talker?: Label | null;
}
export class Dialogs extends UIComponent<IDialogsProps> {
  static override readonly TAGS: string[] = ["Dialogs"];
  static override readonly PROPS: ISchemaMeta<IDialogsProps> = {
    key: "IDialogsProps",
    type: "object",
    properties: {
      head_node: UINode,
      text: Label,
      talker: Label
    }
  }
  protected _listner = new StageDialogListener(this, (d) => this.set_dialog(d));
  protected _head_loader = new UIImgLoader(() => this.props.head_node)
  protected _transform = new Transform()

  override on_start(): void {
    super.on_start?.();
    this._listner.start();
  }

  override on_stop(): void {
    this._listner.stop();
  }
  hide_dialog() {
    this._transform.scale_to(0, 0, 1, true)
    this.node.visible = false;
    this.props.text?.set_text('');
    this.props.talker?.set_text('');
    this._head_loader.set_img([], -1).catch(e => Ditto.warn('' + e))
  }
  show_dialog(dialog: IDialogInfo) {
    this._transform.scale_to(1, 1, 1, true)
    this.node.visible = true;
    const text = this.lf2.string(dialog.i18n)
    this.props.text?.set_text(text);

    const fighter = dialog.fighter ? this.lf2.datas.find_fighter(dialog.fighter) : void 0
    if (fighter) {
      const fighter_name = this.lf2.string(fighter.base.name)
      this.props.talker?.set_text(fighter_name)
    } else {
      this.props.talker?.set_text('')
    }
    if (fighter?.base.head) {
      this._head_loader.set_img([fighter.base.head]).catch(e => Ditto.warn('' + e))
    } else {
      this._head_loader.set_img([], -1).catch(e => Ditto.warn('' + e))
    }
  }
  override update(dt: number): void {
    this._transform.update();
    this.node.set_scale(
      this._transform.scale_x,
      this._transform.scale_y,
      this._transform.scale_z,
    )
  }
  set_dialog(dialog: IDialogInfo | undefined) {
    if (dialog) {
      this.show_dialog(dialog);
    } else {
      this.hide_dialog()
    }
    this.world.transform.move_to(0, dialog ? 60 : 0, 0, true)
  }
}