import { Entity } from "@/LF2/entity";
import { Sine } from "../../animation/Sine";
import Invoker from "../../base/Invoker";
import { Defines } from "../../defines/defines";
import { UIImgLoader } from "../UIImgLoader";
import { GamePrepareLogic } from "./GamePrepareLogic";
import { PlayerScore } from "./PlayerScore";
import { UIComponent } from "./UIComponent";
import { Picture } from "@/LF2";

/**
 * 显示玩家角色选择的角色小头像
 *
 * @export
 * @class PlayerCharacterThumb
 * @extends {UIComponent}
 */
export class FighterThumb extends Picture {
  static override readonly TAGS: string[] = ["FighterThumb"];
  private fighter?: Entity;
  get thumb_url(): string {
    return (
      this.fighter?.data.base.small ?? Defines.BuiltIn_Imgs.CHARACTER_THUMB
    );
  }

  protected _opacity: Sine = new Sine(0.65, 1, 3);

  get gpl(): GamePrepareLogic | undefined {
    return this.node.root.find_component(GamePrepareLogic);
  }

  protected _unmount_jobs = new Invoker();

  constructor(...args: ConstructorParameters<typeof UIComponent>) {
    super(...args);
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

  override on_pause(): void {
    this._unmount_jobs.invoke_and_clear();
  }

  protected handle_changed() {
    this.set_src(this.thumb_url)
  }
}
