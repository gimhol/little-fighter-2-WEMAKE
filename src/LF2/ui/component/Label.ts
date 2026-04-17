import { Ditto } from "@/LF2";
import { IStyle } from "@/LF2/defines";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";

export class Label extends UIComponent {
  static override readonly TAG: string = 'Label';
  static override readonly ALIAS: string[] = ['Text'];
  protected _txt_loader = new UITextLoader(() => this.node).ignore_out_of_date();
  get text(): string { return this.node.txts.value.at(0)?.text ?? '' }
  set text(v: string) { this.set_text(v) }
  get style(): IStyle { return this.node.txts.value.at(0)?.style ?? {} }
  set style(v: IStyle) { this._txt_loader.set_style(v) }

  set_text(v: string | number | boolean) {
    this._txt_loader.set_text(['' + v]).catch(e => Ditto.warn('' + e))
  }
}
