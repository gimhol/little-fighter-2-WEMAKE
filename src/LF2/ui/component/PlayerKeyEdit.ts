import { IUICallback } from "@/LF2";
import { IKeyboardCallback } from "../../ditto";
import { IPointingsCallback } from "../../ditto/pointings/IPointingsCallback";
import { IUIPointerEvent } from "../IUIPointerEvent";
import { PlayerKeyText } from "./PlayerKeyText";

export class PlayerKeyEdit extends PlayerKeyText {
  static override readonly TAG: string = 'PlayerKeyEdit'

  override on_start(): void {
    this.node.parent?.callbacks.add(this.p)
  }
  override on_stop(): void {
    this.node.parent?.callbacks.del(this.p)
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
  private _click_me = false;
  private p: IUICallback = {
    on_click: (e) => {
      this._click_me = true
      console.log('on_click_1', e)
      this.node.focused = !this.node.focused;
      e.stop_immediate_propagation();
    },
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
    on_click: (e) => {
      if (this._click_me) {
        this._click_me = false;
        return
      }
      this.node.focused = false
    }
  };

  override on_key_changed() {
    this.style = {
      fill_style: this.node.focused ? "blue" : 'white',
      font: "14px Arial",
      padding_l: 20,
      padding_r: 20,
      padding_t: 3,
      padding_b: 3,
    }
    this.set_text(this.key_code)
  }
}


