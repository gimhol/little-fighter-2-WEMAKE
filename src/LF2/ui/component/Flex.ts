import { max } from "../../utils";
import { FlexItem } from "./FlexItem";
import { IUICompnentCallbacks } from "./IUICompnentCallbacks";
import { UIComponent } from "./UIComponent";

export type TFlexDirection = 'row' | 'column'
export type TFlexAlign = 'start' | 'center' | 'end' | 'stretch'

export class Flex<Callbacks extends IUICompnentCallbacks = IUICompnentCallbacks> extends UIComponent<Callbacks> {
  static override readonly TAG: string = 'Flex';
  get direction(): TFlexDirection { 
    return this.props_holder.str('direction', ['row', 'column']) ?? 'row' 
  }
  get gap(): number { return this.props_holder.num('gap') ?? 0; }
  get row_gap(): number { return this.props_holder.num('row_gap') ?? this.gap; }
  get col_gap(): number { return this.props_holder.num('col_gap') ?? this.gap; }
  get align(): TFlexAlign { return this.props_holder.str('align', ['start', 'center', 'end', 'stretch']) ?? 'start' }
  get fit(): boolean { return !!this.props_holder.bool('fit') }
  get fit_w(): boolean { return this.props_holder.bool('fit_w') ?? this.fit }
  get fit_h(): boolean { return this.props_holder.bool('fit_h') ?? this.fit }
  get padding(): [number, number, number, number] { return this.props_holder.nums('padding', 4) }

  override update(dt: number): void {
    const {
      direction, col_gap, row_gap, align,
      fit_h, fit_w,
      padding: [padding_top, padding_right, padding_bottom, padding_left]
    } = this;
    let temp_x = padding_left;
    let temp_y = padding_top;
    const my_cross = this.node.cross;

    const { children } = this.node
    if (fit_w || fit_h) {
      let w = 0;
      let h = 0;
      const len = children.length;
      for (let i = 0; i < len; ++i) {
        const child = children[i]
        if (!child.self_visible) continue;
        const [child_w, child_h] = child.size.value
        if (fit_w && direction === 'row')
          w += child_w + (i < len - 1 ? row_gap : 0);
        else if (fit_w && direction === 'column')
          w = max(child_w, w)
        if (fit_h && direction === 'column')
          h += child_h + (i < len - 1 ? col_gap : 0);
        else if (fit_h && direction === 'row')
          h = max(child_h, h)
      }
      if (fit_w) {
        w += padding_left + padding_right;
        this.node.size.value = [w, this.node.size.value[1]];
      }
      if (fit_h) {
        h += padding_top + padding_bottom;
        this.node.size.value = [this.node.size.value[0], h];
      }
    }

    const [my_w, my_h] = this.node.size.value;
    for (const child of this.node.children) {
      if (!child.self_visible) continue;
      const [child_w, child_h] = child.size.value
      const { cross } = child;
      const [x, y, z] = child.pos.value;

      const item = child.find_component(FlexItem, v => v.enabled)
      const item_align = item?.align || align
      if (direction === 'row') {
        const item_x = padding_left + my_cross.left + (temp_x - cross.left)
        switch (item_align) {
          case "start":
            child.pos.value = [item_x, padding_top + my_cross.top - cross.top, z]
            break;
          case "center":
            child.pos.value = [item_x, my_cross.mid_y - cross.mid_y, z]
            break;
          case "end":
            child.pos.value = [item_x, my_cross.bottom - cross.bottom - padding_bottom, z]
            break;
          case "stretch":
            child.pos.value = [item_x, my_cross.top - cross.top, z]
            child.size.value = [child_w, my_h]
            break;
        }
        temp_x += child_w + row_gap;
      } else if (direction === 'column') {
        const item_y = padding_top + my_cross.top + (temp_y - cross.top)
        switch (item_align) {
          case "start":
            child.pos.value = [padding_left + my_cross.left - cross.left, item_y, z]
            break;
          case "center":
            child.pos.value = [my_cross.mid_x - cross.mid_x, item_y, z]
            break;
          case "end":
            child.pos.value = [my_cross.right - cross.right - padding_right, item_y, z]
            break;
          case "stretch":
            child.pos.value = [padding_left + my_cross.left - cross.left, item_y, z]
            child.size.value = [my_w, child_h]
            break;
        }
        temp_y += child_h + col_gap;
      }
    }
  }
}
