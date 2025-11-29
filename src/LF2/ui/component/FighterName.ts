import { Sine } from "../../animation/Sine";
import Invoker from "../../base/Invoker";
import { PlayerInfo } from "../../PlayerInfo";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";

/**
 * 显示玩家角色选择的角色名称
 *
 * @export
 * @class FighterName
 * @extends {UIComponent}
 */
export class FighterName extends UIComponent {
  static override readonly TAG = 'FighterName'
  private _text_loader = new UITextLoader(() => this.node).set_style(() => ({
    fill_style: this.is_com ? "pink" : "white",
    font: "14px Arial",
  })).ignore_out_of_date();
  get player_id() { return this.args[0] || this.node.find_parent(v => v.data.values?.player_id)?.data.values?.player_id || ''; }
  get player(): PlayerInfo { return this.lf2.players.get(this.player_id)! }
  get decided() {
    return !!this.player.character_decided;
  }
  get text(): string {
    const character_id = this.player.character;
    const character = character_id
      ? this.lf2.datas.find_character(character_id)
      : void 0;
    return character?.base.name ?? this.lf2.string("Random");
  }
  get joined(): boolean {
    return true === this.player.joined;
  }
  get is_com(): boolean {
    return true === this.player.is_com;
  }
  protected _opacity: Sine = new Sine(0.65, 1, 6);
  protected _unmount_jobs = new Invoker();

  override on_resume(): void {
    super.on_resume();
    this._unmount_jobs.add(
      this.player.callbacks.add({
        on_is_com_changed: () => this.handle_changed(),
        on_joined_changed: () => this.handle_changed(),
        on_character_changed: () => this.handle_changed(),
        on_random_character_changed: () => this.handle_changed(),
      }),
    );
    this.handle_changed();
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  protected handle_changed() {
    this._text_loader.set_text([this.text])
    this.node.set_visible(this.joined)
  }

  override update(dt: number): void {
    this._opacity.update(dt);
    this.node.opacity = this.decided ? 1 : this._opacity.value;
  }
}
