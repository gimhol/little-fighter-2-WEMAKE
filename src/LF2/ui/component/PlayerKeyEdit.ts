import { IKeyboardCallback } from "../../ditto";
import { IPointingsCallback } from "../../ditto/pointings/IPointingsCallback";
import { IUIPointerEvent } from "../IUIPointerEvent";
import { ui_load_txt } from "../ui_load_txt";
import { PlayerKeyText as UIComponent } from "./PlayerKeyText";

export class PlayerKeyEdit extends UIComponent {
  static override readonly TAG: string = 'PlayerKeyEdit'
  override on_click(e: IUIPointerEvent) {
    this.node.focused = !this.node.focused;
    e.stop_immediate_propagation();
  }
  override on_foucs(): void {
    super.on_foucs?.();
    this.on_key_changed();
    this.lf2.pointings.callback.add(this.r);
    this.lf2.keyboard.callback.add(this.l);
  }
  override on_blur(): void {
    super.on_blur?.();
    this.on_key_changed();
    this.lf2.pointings.callback.del(this.r);
    this.lf2.keyboard.callback.del(this.l);
  }

  private l: IKeyboardCallback = {
    on_key_down: (e) => {
      if (!this.node.focused) return;
      if ("escape" !== e.key.toLowerCase()) {
        this.player?.set_key(this.key_name, e.key, true).save();
        const others = this.node.root.search_components(PlayerKeyEdit, v => v.player === this.player);
        const idx = others.indexOf(this);
        const next = others[idx + 1];
        if (next) next.node.focused = true
      }
      this.node.focused = false;
    }
  }
  private r: IPointingsCallback = {
    on_pointer_down: () => this.node.focused = false
  };

  override on_key_changed() {
    ui_load_txt(this.lf2, {
      i18n: this.key_code, style: {
        fill_style: this.node.focused ? "blue" : 'white',
        font: "14px Arial",
        padding_l: 20,
        padding_r: 20,
        padding_t: 3,
        padding_b: 3,
      }
    }).then(v => {
      this.node.txts.value = v;
      this.node.txt_idx.value = 0;
      const { w, h, scale } = v[0]!
      this.node.size.value = [w / scale, h / scale];
    })
  }
}


