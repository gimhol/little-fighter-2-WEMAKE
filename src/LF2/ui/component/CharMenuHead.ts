import { floor } from "@/LF2/utils";
import { Sine } from "../../animation/Sine";
import { UIImgLoader } from "../UIImgLoader";
import { GamePrepareLogic } from "./GamePrepareLogic";
import { UIComponent } from "./UIComponent";

/**
 * 显示玩家角色选择的角色头像
 *
 * @export
 * @class CharMenuHead
 * @extends {UIComponent}
 */
export class CharMenuHead extends UIComponent {
  static override readonly TAG = 'CharMenuHead'
  readonly img_loader = new UIImgLoader(() => this.node);
  private _head?: string;
  set_head(path: string) {
    this.img_loader.load([{ path, w: 120, h: 120 }], 0).catch(_ => _)
    this.node.img_idx.value = 0
    this.hints_node?.set_visible(false);
    this.countdown_node?.set_visible(false);
  }
  quit() {
    this.node.img_idx.value = -1
    this.hints_node?.set_visible(true);
    this.countdown_node?.set_visible(false);
  }
  protected _opacity: Sine = new Sine(0.65, 1, 6);
  get countdown_node() { return this.node.find_child("countdown_text") }
  get hints_node() { return this.node.find_child("hints") }
  get gpl(): GamePrepareLogic | undefined {
    return this.node.root.find_component(GamePrepareLogic);
  }
  override update(dt: number): void {
    this._opacity.update(dt);
    if (this.hints_node) {
      if (this._head) this.hints_node.opacity = 0;
      else this.hints_node.opacity = this._opacity.value;
    }
  }
  count_down(num: number): void {
    const { countdown_node } = this;
    if (!countdown_node) return;
    num = floor(num)
    countdown_node.txt_idx.value = num - 1
    if (num) {
      countdown_node.visible = true;
      this.node.img_idx.value = -1;
      this.hints_node?.set_visible(false)
    } else {
      countdown_node.visible = false;
      this.node.img_idx.value = 0;
    }
  }
}
