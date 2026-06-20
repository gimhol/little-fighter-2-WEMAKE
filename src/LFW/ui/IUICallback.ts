import { UIComponent } from "./component/UIComponent";
import { LF2PointerEvent } from "./LF2PointerEvent";
import type { UINode } from "./UINode";
export interface IUICallback {
  on_click?(e: LF2PointerEvent): void;
  on_show?(node: UINode): void;
  on_hide?(node: UINode): void;
  on_foucs_changed?(node: UINode): void;
  on_foucs_item_changed?(
    foucs: UINode | undefined,
    blur: UINode | undefined
  ): void;
  on_component_add?(component: UIComponent, node: UINode): void;
  on_component_del?(component: UIComponent, node: UINode): void;
  on_pointer_down?(e: LF2PointerEvent, node: UINode): void;
  on_pointer_move?(e: LF2PointerEvent, node: UINode): void;
  on_pointer_up?(e: LF2PointerEvent, node: UINode): void;
  on_pointer_cancel?(e: LF2PointerEvent, node: UINode): void;
  on_pointer_leave?(node: UINode): void;
  on_pointer_enter?(node: UINode): void;
}
