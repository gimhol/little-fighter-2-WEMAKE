import { IPropsMeta, Label } from "@/LF2";
import { Difficulty } from "../../defines";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { IUIPointerEvent } from "../IUIPointerEvent";
import { UINode } from "../UINode";
import { IJalousieCallbacks, Jalousie } from "./Jalousie";
import { UIComponent } from "./UIComponent";
export interface IEndingPageLogicProps {
  label: Label | undefined;
  jalousie: Jalousie | undefined;
}
export class EndingPageLogic extends UIComponent<IEndingPageLogicProps> {
  static override readonly TAGS: string[] = [`EndingPageLogic`];
  static override readonly PROPS: IPropsMeta<IEndingPageLogicProps> = {
    label: { type: Label, nullable: false },
    jalousie: { type: Jalousie, nullable: false },
  }
  protected texts_idx = 0;
  protected texts = [
    "old_ending_0_0",
    "old_ending_0_1",
    "old_ending_1",
    "old_ending_2",
    "old_ending_3",
    "gim_ending_0",
    "gim_ending_1",
    "gim_ending_2",
    "gim_ending_3",
  ]
  protected jalousie_cbs: IJalousieCallbacks = {
    on_anim_end: (j) => this.on_jalousie_anim_end(j)
  }
  override on_start(): void {
    super.on_start?.();
    this.texts_idx = -1
    this.props.label?.preload(this.texts)
    this.props.jalousie?.callbacks.add(this.jalousie_cbs)
  }
  override on_resume(): void {
    super.on_resume()
    this.lf2.sounds.stop_bgm()
    if (this.props.jalousie?.anim.done) this.props.jalousie.open = !this.props.jalousie.open
  }
  override on_stop(): void {
    super.on_stop?.();
    this.props.jalousie?.callbacks.del(this.jalousie_cbs)
  }
  override on_click(e: IUIPointerEvent): void {
    if (this.props.jalousie?.anim.done) this.props.jalousie.open = !this.props.jalousie.open
  }
  override on_key_down(e: IUIKeyEvent): void {
    if (this.props.jalousie?.anim.done) this.props.jalousie.open = !this.props.jalousie.open
  }
  on_jalousie_anim_end(j: Jalousie): void {
    if (j.open) return;
    do {
      const { label } = this.props;
      if (!label) continue;
      if (this.texts_idx === -1 && this.world.difficulty >= Difficulty.Difficult)
        this.texts_idx += 2
      else
        this.texts_idx += 1
      if (this.texts_idx >= this.texts.length) {
        if (this.lf2.ui_stacks[0].uis.length > 1) {
          this.lf2.pop_ui({ until: (_, i) => i === 0 })
        } else {
          this.lf2.set_ui({ id: "main_page" })
          this.lf2.sounds.play_bgm("bgm/main.wma.mp3")
        }
        break;
      }
      label.set_text(this.texts[this.texts_idx])
    } while (0);
    j.open = true;
  }
}
