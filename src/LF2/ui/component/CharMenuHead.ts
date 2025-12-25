import { Sine } from "../../animation/Sine";
import Invoker from "../../base/Invoker";
import { Defines } from "../../defines/defines";
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
  set_head(path: string | undefined) {
    if (this._head === path) return;
    this._head = path;
    if (path) {
      this.img_loader.load([{ path, w: 120, h: 120 }], 0).catch(_ => _)
      this.node.img_idx.value = 0
    } else {
      this.node.img_idx.value = -1
    }
  }
  quit() {
    this.set_head(void 0)
  }
  protected _opacity: Sine = new Sine(0.65, 1, 6);
  get countdown_node() { return this.node.find_child("countdown_text") }
  get hints_node() { return this.node.find_child("hints") }
  get gpl(): GamePrepareLogic | undefined {
    return this.node.root.find_component(GamePrepareLogic);
  }
  protected _unmount_jobs = new Invoker();
  constructor(...args: ConstructorParameters<typeof UIComponent>) {
    super(...args);
  }

  override update(dt: number): void {
    this._opacity.update(dt);
    if (this.hints_node) {
      if (this._head) this.hints_node.opacity = 0;
      else this.hints_node.opacity = this._opacity.value;
    }

  }
}
