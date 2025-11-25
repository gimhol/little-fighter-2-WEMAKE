import { Difficulty } from "../../defines";
import { IUIPointerEvent } from "../IUIPointerEvent";
import { UINode } from "../UINode";
import { IJalousieCallbacks, Jalousie } from "./Jalousie";
import { UIComponent } from "./UIComponent";

export class EndingPageLogic extends UIComponent {
  static override readonly TAG: string = `EndingPageLogic`;
  jalousie: Jalousie | undefined;
  txt_node: UINode | undefined;
  jalousie_cbs: IJalousieCallbacks = {
    on_anim_end: (j) => this.on_jalousie_anim_end(j)
  }
  override on_start(): void {
    super.on_start?.();
    this.jalousie = this.node.search_component(Jalousie);
    this.jalousie?.callbacks.add(this.jalousie_cbs)
    this.txt_node = this.node.search_child('txt_b')
  }
  override on_resume(): void {
    super.on_resume()
    this.lf2.sounds.stop_bgm()
    if (this.jalousie?.anim.done) this.jalousie.open = !this.jalousie.open
  }
  override on_stop(): void {
    super.on_stop?.();
    this.jalousie?.callbacks.del(this.jalousie_cbs)
  }
  override on_click(e: IUIPointerEvent): void {
    if (this.jalousie?.anim.done) this.jalousie.open = !this.jalousie.open
  }
  override on_key_down(e: IUIPointerEvent): void {
    if (this.jalousie?.anim.done) this.jalousie.open = !this.jalousie.open
  }
  on_jalousie_anim_end(j: Jalousie): void {
    if (j.open) return;

    if (this.txt_node) {
      const i = this.txt_node.txt_idx.value++
      const l = this.txt_node.txts.value.length;
      if (i < l - 1) {
        if (i === 0 && this.world.difficulty >= Difficulty.Difficult) {
          this.txt_node.txt_idx.value = i + 2
        } else {
          this.txt_node.txt_idx.value = i + 1
        }
        const txt_idx = this.txt_node.txt_idx.value
        const { w, h, scale } = this.txt_node.txts.value[txt_idx]!
        this.txt_node.size.value = ([w / scale, h / scale])
      } else {
        if (this.lf2.ui_stacks[0].uis.length > 1) {
          this.lf2.pop_ui(true, (_, i) => i === 0)
        } else {
          this.lf2.set_ui("main_page")
          this.lf2.sounds.play_bgm("bgm/main.wma.mp3")
        }
      }
    }
    j.open = true;
  }
}
