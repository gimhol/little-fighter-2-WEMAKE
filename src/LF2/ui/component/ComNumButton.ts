import { IUIKeyEvent } from "../IUIKeyEvent";
import { IUIPointerEvent } from "../IUIPointerEvent";
import { GamePrepareLogic } from "./GamePrepareLogic";
import { UIComponent } from "./UIComponent";

export class ComNumButton extends UIComponent {
  static override readonly TAG = 'ComNumButton'
  get gpl() {
    return this.node.root.search_component(GamePrepareLogic);
  }
  override on_click(e: IUIPointerEvent): void {
    this.gpl?.set_com_num(this.num(0) || 0);
    e.stop_immediate_propagation();
  }
  override on_key_down(e: IUIKeyEvent): void {
    if (e.game_key === 'a' && this.node.focused) {
      this.gpl?.set_com_num(this.num(0) || 0);
      e.stop_immediate_propagation();
    }
  }
  override on_show(): void {
    super.on_show?.();
    const { gpl } = this;
    const num = this.num(0) || 0
    if (!gpl) return;
    const { min_com_num, max_com_num } = gpl;
    this.node.disabled = num < min_com_num || num > max_com_num;
  }
}
