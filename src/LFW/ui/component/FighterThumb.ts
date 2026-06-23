import { Defines } from "../../defines/defines";
import type { Entity } from "../../entity/Entity";
import { Picture } from './Picture';
import { PlayerScore } from "./PlayerScore";

/**
 * 显示玩家角色选择的角色小头像
 *
 * @export
 * @class PlayerCharacterThumb
 * @extends {Picture}
 */
export class FighterThumb extends Picture {
  static override readonly TAGS: string[] = ["FighterThumb"];
  protected fighter?: Entity;
  get thumb_url(): string {
    return (
      this.fighter?.data.base.small ?? Defines.BuiltIn_Imgs.CHARACTER_THUMB
    );
  }
  override on_start(): void {
    this.width = 40;
    this.height = 45;
  }
  override on_show(): void {
    this.fighter = this.node.lookup_component(PlayerScore)?.fighter;
    this.handle_changed();
  }
  protected handle_changed() {
    this.set_src(this.thumb_url)
  }
}
