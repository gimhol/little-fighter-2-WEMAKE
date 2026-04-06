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
  protected _joined: boolean = false;
  protected _opacity: Sine = new Sine(0.65, 1, 6);
  protected _path: string = '';
  get countdown_node() { return this.node.find_child("countdown_text") }
  get hints_node() { return this.node.find_child("hints") }
  get gpl(): GamePrepareLogic | undefined {
    return this.node.root.find_component(GamePrepareLogic);
  }
  join(path: string): void {
    this._joined = true;
    this._path = path;
    this.img_loader.load([{ path, w: 120, h: 120 }], 0).catch(_ => _)
    this.node.img_idx.value = 0
    this.hints_node?.set_visible(false);
    this.countdown_node?.set_visible(false);
  }
  quit(): void {
    this._joined = false;
    this._path = '';
    this.img_loader.load([{ path: '', w: 120, h: 120 }], 0).catch(_ => _)
    this.node.img_idx.value = -1
    this.hints_node?.set_visible(true);
    this.countdown_node?.set_visible(false);
  }
  override update(dt: number): void {
    this._opacity.update(dt);

    const hints_visible = !this._joined && !this.countdown_node?.visible
    this.hints_node?.set_visible(hints_visible);
    this.hints_node?.set_opacity(this._opacity.value);

    const head_visible = !hints_visible && !this.countdown_node?.visible && !!this._path
    this.node.img_idx.value = head_visible ? 0 : -1;
  }
  count_down(num: number): void {
    const { countdown_node } = this;
    if (!countdown_node) return;
    num = floor(num)
    countdown_node.txt_idx.value = num - 1
    countdown_node.visible = !!num;
  }
}
