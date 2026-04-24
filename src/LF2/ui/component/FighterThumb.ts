import { Picture } from "@/LF2";
import { Entity } from "@/LF2/entity";
import { Sine } from "../../animation/Sine";
import { Defines } from "../../defines/defines";
import { GamePrepareLogic } from "./GamePrepareLogic";
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
  protected _opacity: Sine = new Sine(0.65, 1, 3);
  get thumb_url(): string {
    return (
      this.fighter?.data.base.small ?? Defines.BuiltIn_Imgs.CHARACTER_THUMB
    );
  }

  get gpl(): GamePrepareLogic | undefined {
    return this.node.root.find_component(GamePrepareLogic);
  }
  override on_start(): void {
    this.width = 40;
    this.height = 45;
  }
  override on_resume(): void {
    this.fighter = this.node.lookup_component(PlayerScore)?.fighter;
  }
  override on_show(): void {
    this.handle_changed();
  }
  protected handle_changed() {
    this.set_src(this.thumb_url)
  }
}
