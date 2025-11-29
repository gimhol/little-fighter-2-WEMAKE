import { CtrlDevice } from "../../defines/CtrlDevice";
import { IUIPointerEvent } from "../IUIPointerEvent";
import { UIComponent } from "./UIComponent";

export class PlayerCtrlType extends UIComponent {
  static override readonly TAG: string = 'PlayerCtrlType';
  get player_id() { return this.args[0] || this.node.find_parent(v => v.data.values?.player_id)?.data.values?.player_id || ''; }
  get player_info() { return this.lf2.players.get(this.player_id)! }
  override on_resume(): void {
    super.on_resume();
    this.player_info.callbacks.add(this)
    this.on_ctrl_changed()
  }
  override on_click(e: IUIPointerEvent) {
    this.node.focused = true;
    e.stop_immediate_propagation();
    this.node.next_img();
    const ctrl: CtrlDevice = (this.node.img_idx.value % 5) as CtrlDevice
    this.player_info.set_ctrl(ctrl, true).save()
  }
  on_ctrl_changed() {
    this.node.img_idx.value = this.player_info.ctrl % this.node.imgs.value.length;
  }
}

