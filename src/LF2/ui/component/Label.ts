import { IStyle } from "@/LF2/defines";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";

export class Label extends UIComponent {
  static override readonly TAGS: string[] = ["Label", "Text"];
  protected _txt_loader = new UITextLoader(() => this.node)//.ignore_out_of_date();
  get text(): string { return this._txt_loader.text }
  set text(v: string) { this.set_text(v) }
  get style(): IStyle { return this._txt_loader.style }
  set style(v: IStyle) { this._txt_loader.style = v }
  set_text(v: string): this {
    this._txt_loader.text = v
    return this;
  }
  preload(texts: string[]): this {
    this._txt_loader.preload(texts)
    return this;
  }
}
