import { IStyle } from "@/LF2/defines";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";

export class Text extends UIComponent {
  static override readonly TAG: string = 'Text';
  protected _txt_loader = new UITextLoader(() => this.node);
  get text(): string { return this.node.txts.value.at(0)?.text ?? '' }
  set text(v: string) { this.set_text(v) }
  get style(): IStyle { return this.node.txts.value.at(0)?.style ?? {} }
  set style(v: IStyle) { this._txt_loader.set_style(v) }

  set_text(v: string | number | boolean) {
    this._txt_loader.set_text(['' + v])
  }
}
