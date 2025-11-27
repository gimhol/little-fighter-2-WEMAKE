import type { IUICallback } from "../IUICallback";
import type { IUIPointerEvent } from "../IUIPointerEvent";
import type { UINode } from "../UINode";
import { UIComponent } from "./UIComponent";


export class TxtClickable extends UIComponent {
  static override readonly TAG = 'TxtClickable';
  press_idx: number = 0;
  hover_idx: number = 1;
  normal_idx: number = 2;
  listening: UINode | null = null;
  responser: UINode | null = null;
  ui_callbacks: IUICallback = {
    on_pointer_enter: (): void => {
      if (this.responser)
        this.responser.txt_idx.value = this.hover_idx;
    },
    on_pointer_leave: (): void => {
      if (this.responser)
        this.responser.txt_idx.value = this.normal_idx;
    },
    on_pointer_down: (e: IUIPointerEvent): void => {
      if (this.responser)
        this.responser.txt_idx.value = this.press_idx;
    },
    on_pointer_up: (e: IUIPointerEvent): void => {
      if (this.responser)
        this.responser.txt_idx.value = this.hover_idx;
    }
  };
  override on_start(): void {
    super.on_start?.();
    this.hover_idx = this.props.num("hover_idx") ?? this.hover_idx;
    this.normal_idx = this.props.num("normal_idx") ?? this.normal_idx;
    this.press_idx = this.props.num("press_idx") ?? this.press_idx;
    this.listening = this.find_node(this.props.str("listening"));
    this.responser = this.find_node(this.props.str("responser"));
    this.listening?.callbacks.add(this.ui_callbacks);
  }
  override on_stop(): void {
    this.listening?.callbacks.del(this.ui_callbacks);
  }
}
