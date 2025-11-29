import { Sine } from "../../animation/Sine";
import Invoker from "../../base/Invoker";
import { ui_load_txt } from "../ui_load_txt";
import { GamePrepareLogic, GamePrepareState } from "./GamePrepareLogic";
import { UIComponent } from "./UIComponent";
/**
 * 显示玩家名称
 *
 * @export
 * @class PlayerName
 * @extends {UIComponent}
 */
export class PlayerName extends UIComponent {
  static override readonly TAG: string = 'PlayerName';
  get player_id() { return this.args[0] || this.node.find_parent(v => v.data.values?.player_id)?.data.values?.player_id || ''; }

  get player() {
    return this.lf2.players.get(this.player_id);
  }
  get player_name() {
    return this.player?.name ?? this.player_id;
  }
  get joined(): boolean {
    return true === this.player?.joined;
  }
  get is_com(): boolean {
    return true === this.player?.is_com;
  }
  get gpl(): GamePrepareLogic | undefined {
    return this.node.root.find_component(GamePrepareLogic);
  }
  get can_join(): boolean {
    return this.gpl?.state === GamePrepareState.Player;
  }
  protected get text(): string {
    if (this.is_com) return this.lf2.string("char_menu.computer");
    if (this.joined) return this.player_name;
    if (this.can_join) return this.lf2.string("char_menu.join_q");
    return "";
  }
  protected _opacity: Sine = new Sine(0.65, 0.35, 3);
  protected _unmount_jobs = new Invoker();

  override on_resume(): void {
    super.on_resume();

    this._unmount_jobs.add(
      this.player?.callbacks.add({
        on_is_com_changed: () => this.handle_changed(),
        on_joined_changed: () => this.handle_changed(),
        on_name_changed: () => this.handle_changed(),
      }),
      this.gpl?.fsm.callbacks.add({
        on_state_changed: () => this.handle_changed(),
      })
    );
    this.handle_changed();
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  protected handle_changed() {
    ui_load_txt(this.lf2, {
      i18n: this.text, style: {
        fill_style: this.is_com ? "pink" : "white",
        font: "14px Arial",
      }
    }).then(v => {
      this.node.txts.value = v;
      this.node.txt_idx.value = 0;
      const { w, h, scale } = v[0]!
      this.node.size.value = [w / scale, h / scale];
    })
  }

  override update(dt: number): void {
    this._opacity.update(dt);
    this.node.opacity = this.joined ? 1 : this._opacity.value;
  }
}
