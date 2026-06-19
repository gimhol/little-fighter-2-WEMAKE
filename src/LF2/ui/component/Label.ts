import type { IStyle } from "../../defines";
import { TextInfo } from "../../ditto/image/TextInfo";
import { UIComponent } from "./UIComponent";

export class Label extends UIComponent {
  static override readonly TAGS: string[] = ["Label", "Text"];
  get text(): string { return this.node.text?.text ?? '' }
  set text(v: string) { this.set_text(v) }
  get style(): IStyle { return this.node.text?.style ?? {} }
  set style(v: IStyle) { this.node.text?.merge({ style: v }) }
  override on_start(): void {
    this.style = this.node.style;
  }
  set_text(v: string): this {
    this.node.text = new TextInfo({ text: v, style: this.node.style });
    return this;
  }
  preload(_texts: string[]): this {
    return this;
  }
}
