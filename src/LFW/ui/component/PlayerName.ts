import { Sine } from "../../animation/Sine";
import { TextInfo } from "../../ditto/image/TextInfo";
import { UIComponent } from "./UIComponent";
/**
 * 显示玩家名称
 *
 * @export
 * @class PlayerName
 * @extends {UIComponent}
 */
export class PlayerName extends UIComponent {
  static override readonly TAGS: string[] = ["PlayerName"];
  private _decided?: boolean;
  private _com?: boolean;

  join(text: string, com: boolean, decided: boolean) {
    this._decided = decided;
    this._com = com;
    this._decided = true;
    this.node.text = new TextInfo({
      text,
      style: {
        fill_style: com ? "pink" : "white",
        font: "14px Arial",
      }
    });
    this.node.visible = true
  }

  quit() {
    this._decided = void 0;
    this._com = void 0;
    const text = this.lfw.string("char_menu.join_q")
    this.node.text = new TextInfo({
      text,
      style: {
        fill_style: "white",
        font: "14px Arial",
      }
    });
  }

  protected _opacity: Sine = new Sine(0.65, 0.35, 3);
  override update(dt: number): void {
    this._opacity.update(dt);
    this.node.opacity = this._decided ? 1 : this._opacity.value;
  }
}
