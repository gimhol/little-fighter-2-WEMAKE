import Invoker from "../../base/Invoker";
import { Defines } from "../../defines/defines";
import { IPlayerInfoCallback } from "../../IPlayerInfoCallback";
import { PlayerInfo } from "../../PlayerInfo";
import { UIImgLoader } from "../UIImgLoader";
import { UIComponent } from "./UIComponent";

/**
 * 角色头像
 *
 * @export
 * @class FighterHead
 * @extends {UIComponent}
 */
export class FighterHead extends UIComponent {
  static override readonly TAG = 'FighterHead'
  get player_id() { return this.args[0] || this.node.find_parent(v => v.data.values?.player_id)?.data.values?.player_id || ''; }
  get player(): PlayerInfo { return this.lf2.players.get(this.player_id)!; }
  img_loader = new UIImgLoader(() => this.node);
  get head() {
    const fighter_data = this.player?.fighter?.data;
    if (!fighter_data) return Defines.BuiltIn_Imgs.RFACE;
    const head = fighter_data.base.head;
    return head ?? Defines.BuiltIn_Imgs.RFACE;
  }

  protected _unmount_jobs = new Invoker();

  constructor(...args: ConstructorParameters<typeof UIComponent>) {
    super(...args);
  }
  override on_resume(): void {
    super.on_resume();
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  protected handle_changed() {
    this.img_loader.load([{ path: this.head, w: 120, h: 120 }], 0).catch(_ => _)
  }
}
