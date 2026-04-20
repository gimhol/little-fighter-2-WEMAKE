import { parse_call_func_expression } from "../utils";
import { FadeOutOpacity } from "./FadeOutOpacity";
import { Label } from "./Label";

export class LoadingContentText extends Label {
  static override readonly TAGS: string[] = ["LoadingContentText"]
  get fade_out_duration() { return this.num(1) ?? 0 };
  get fade_out_delay() { return this.num(2) ?? 0 }
  protected fadeout?: FadeOutOpacity;

  override init(): this {
    if (this.fade_out_duration) {
      const expression = FadeOutOpacity.expression(
        this.fade_out_duration,
        this.fade_out_delay
      ).done();
      // TODO: fix it.
      const pr = parse_call_func_expression(expression);
      if (pr) {
        this.fadeout = this.lf2.factory.create_components(this.node, [{ ...pr }])[0] as FadeOutOpacity
        this.node.add_components(this.fadeout)
      }
    }
    return this;
  }

  override on_resume(): void {
    super.on_resume();
    this.lf2.callbacks.add(this);
  }

  override on_pause(): void {
    super.on_pause();
    this.lf2.callbacks.del(this);
  }

  on_loading_end() {
    const page = this.str(0)
    if (page) this.lf2.set_ui({ id: page })
    else this.on_loading_content("waiting_others_players", 0)
  }

  on_loading_content(text: string, progress: number) {
    this.fadeout?.start();
    const str = progress ? `loading: ${text}(${progress}%)` : ` loading: ${text}`;
    this.set_text(str)
  }
}
