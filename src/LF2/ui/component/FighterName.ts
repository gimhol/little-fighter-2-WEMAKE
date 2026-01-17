import { Sine } from "../../animation/Sine";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";

/**
 * 显示玩家角色选择的角色名称
 *
 * @export
 * @class FighterName
 * @extends {UIComponent}
 */
export class FighterName extends UIComponent {
  static override readonly TAG = 'FighterName'
  private _decided?: boolean;
  private _com?: boolean;
  private readonly txt_loader = new UITextLoader(() => this.node).set_style(() => ({
    fill_style: this._com ? "pink" : "white",
    font: "14px Arial",
  })).ignore_out_of_date()

  join(text: string, com: boolean, decided: boolean) {
    this._decided = decided;
    this._com = com;
    this.txt_loader.set_text([text])
    this.node.visible = true
  }
  quit() {
    this._com = void 0;
    this._decided = void 0;
    const text = this.lf2.string(" ")
    this.txt_loader.set_text([text])
    this.node.visible = false
  }
  protected _opacity: Sine = new Sine(0.65, 1, 6);
  override update(dt: number): void {
    this._opacity.update(dt);
    this.node.opacity = this._decided ? 1 : this._opacity.value;
  }
}

