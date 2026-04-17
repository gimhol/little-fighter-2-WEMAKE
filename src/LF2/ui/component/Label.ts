import { IStyle } from "@/LF2/defines";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";

export class Label extends UIComponent {
  static override readonly TAG: string = 'Label';
  static override readonly ALIAS: string[] = ['Text'];
  protected _txt_loader = new UITextLoader(() => this.node).ignore_out_of_date();
  get text(): string { return this._txt_loader.text }
  set text(v: string | number | boolean) { this.set_text(v) }
  get style(): IStyle { return this._txt_loader.style }
  set style(v: IStyle) { this._txt_loader.style = v }
  set_text(v: string | number | boolean): this {
    this._txt_loader.text = '' + v
    return this;
  }
}
