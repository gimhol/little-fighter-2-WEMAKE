import { Picture } from "@/LF2";
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
export class FighterHead extends Picture {
  static override readonly TAGS: string[] = ["FighterHead"];
  get player_id() { return this.args[0] || this.node.find_parent(v => v.data.values?.player_id)?.data.values?.player_id || ''; }
  get player(): PlayerInfo { return this.lf2.players.get(this.player_id)!; }
  get head() {
    const fighter_data = this.player?.fighter?.data;
    if (!fighter_data) return Defines.BuiltIn_Imgs.RFACE;
    const head = fighter_data.base.head;
    return head ?? Defines.BuiltIn_Imgs.RFACE;
  }
  override on_start(): void {
    super.on_start?.();
    this.width = 120;
    this.height = 120;
  }

  protected handle_changed() {
    this.set_src(this.head)
  }
}
