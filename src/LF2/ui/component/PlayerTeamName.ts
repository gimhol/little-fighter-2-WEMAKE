import { Sine } from "../../animation/Sine";
import Invoker from "../../base/Invoker";
import { Defines } from "../../defines/defines";
import { ui_load_txt } from "../ui_load_txt";
import { UIComponent } from "./UIComponent";

/**
 * 显示玩家队伍名
 *
 * @export
 * @class PlayerTeamName
 * @extends {UIComponent}
 */
export class PlayerTeamName extends UIComponent {
  static override readonly TAG: string = 'PlayerTeamName';
  get player_id() { return this.args[0] || this.node.find_parent(v => v.data.values?.player_id)?.data.values?.player_id || ''; }
  get player() {
    return this.lf2.players.get(this.player_id);
  }
  get decided() {
    return !!this.player?.team_decided;
  }
  get text(): string {
    const team = this.player?.team;
    if(team === void 0) return ''
    const info = Defines.TeamInfoMap[team]
    if(info === void 0) return ''
    return this.lf2.string(info.i18n);
  }
  get is_com(): boolean {
    return true === this.player?.is_com;
  }

  protected _opacity: Sine = new Sine(0.65, 1, 3);
  protected _unmount_jobs = new Invoker();


  override on_resume(): void {
    super.on_resume();
    this._unmount_jobs.add(
      this.player?.callbacks.add({
        on_is_com_changed: () => this.handle_changed(),
        on_character_decided: () => this.handle_changed(),
        on_team_changed: () => this.handle_changed(),
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
    this.node.set_visible(!!this.player?.character_decided)
  }

  override update(dt: number): void {
    this._opacity.update(dt);
    this.node.opacity = this.decided ? 1 : this._opacity.value;
  }
}
