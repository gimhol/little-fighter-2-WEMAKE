import { UITextLoader } from "../UITextLoader";
import { parse_call_func_expression } from "../utils";
import inst from "./Factory";
import { FadeOutOpacity } from "./FadeOutOpacity";
import { UIComponent } from "./UIComponent";

export class LoadingContentText extends UIComponent {
  static override readonly TAG = "LoadingContentText"
  private _text_loader = new UITextLoader(() => this.node)
    .set_style(() => this.node.style)
    .ignore_out_of_date();

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
        this.fadeout = inst.create(this.node, [{ ...pr }])[0] as FadeOutOpacity
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
    if (page) this.lf2.set_ui(page)
  }

  on_loading_content(text: string, progress: number) {
    this.fadeout?.start();
    const str = progress ? `loading: ${text}(${progress}%)` : ` loading: ${text}`;
    this._text_loader.set_text([str])
  }
}
