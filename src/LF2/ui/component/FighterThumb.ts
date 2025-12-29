import { Sine } from "../../animation/Sine";
import Invoker from "../../base/Invoker";
import { Defines } from "../../defines/defines";
import { UIImgLoader } from "../UIImgLoader";
import { GamePrepareLogic } from "./GamePrepareLogic";
import { PlayerScore } from "./PlayerScore";
import { UIComponent } from "./UIComponent";

/**
 * 显示玩家角色选择的角色小头像
 *
 * @export
 * @class PlayerCharacterThumb
 * @extends {UIComponent}
 */
export class FighterThumb extends UIComponent {
  static override readonly TAG = 'FighterThumb'
  private _player_id?: string;
  img_loader = new UIImgLoader(() => this.node).ignore_out_of_date();

  get player_id() {
    return this.args[0] || this._player_id || "";
  }

  get character() {
    return this.world.slot_fighters.get(this.player_id);
  }

  get thumb_url(): string {
    return (
      this.character?.data.base.small ?? Defines.BuiltIn_Imgs.CHARACTER_THUMB
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
  override on_resume(): void {
    super.on_resume();
    this._player_id = this.node.lookup_component(PlayerScore)?.player_id;
  }

  override on_show(): void {
    this.handle_changed();
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  protected handle_changed() {
    this.img_loader.load([{ path: this.thumb_url, w: 40, h: 45 }], 0).catch(_ => _)
  }
}
