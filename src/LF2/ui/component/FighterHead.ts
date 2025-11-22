import { Sine } from "../../animation/Sine";
import Invoker from "../../base/Invoker";
import { Defines } from "../../defines/defines";
import { IPlayerInfoCallback } from "../../IPlayerInfoCallback";
import { PlayerInfo } from "../../PlayerInfo";
import { between } from "../../utils";
import { UIImgLoader } from "../UIImgLoader";
import GamePrepareLogic, { GamePrepareState } from "./GamePrepareLogic";
import { UIComponent } from "./UIComponent";

/**
 * 显示玩家角色选择的角色头像
 *
 * @export
 * @class FighterHead
 * @extends {UIComponent}
 */
export default class FighterHead extends UIComponent {
  static override readonly TAG = 'FighterHead'
  get player_id() { return this.args[0] || this.node.find_parent(v => v.data.values?.player_id)?.data.values?.player_id || ''; }
  get player(): PlayerInfo { return this.lf2.players.get(this.player_id)!; }
  img_loader = new UIImgLoader(() => this.node).ignore_out_of_date();
  get head() {
    const character_id = this.player?.character;
    if (!character_id) return Defines.BuiltIn_Imgs.RFACE;
    const head = this.lf2.datas.find_character(character_id)?.base.head;
    return head ?? Defines.BuiltIn_Imgs.RFACE;
  }

  protected _opacity: Sine = new Sine(0.65, 1, 6);
  get countdown_node() { return this.node.find_child("countdown_text") }
  get hints_node() { return this.node.find_child("hints") }
  get gpl(): GamePrepareLogic | undefined {
    return this.node.root.find_component(GamePrepareLogic);
  }
  protected _unmount_jobs = new Invoker();

  protected _player_callbacks: IPlayerInfoCallback = {
    on_joined_changed: () => this.handle_changed(),
    on_character_changed: () => this.handle_changed(),
    on_random_character_changed: () => this.handle_changed(),
  }
  constructor(...args: ConstructorParameters<typeof UIComponent>) {
    super(...args);
  }
  override on_resume(): void {
    super.on_resume();
    this.player?.callbacks.add(this._player_callbacks);
    this._unmount_jobs.add(
      this.gpl?.callbacks.add({
        on_countdown: (seconds) => {
          if (between(seconds, 1, 5))
            this.countdown_node!.txt_idx.value = (seconds - 1);
        },
      }),
      this.gpl?.fsm.callbacks.add({
        on_state_changed: () => this.handle_changed(),
      }),
    );
  }

  override on_pause(): void {
    super.on_pause();
    this.player?.callbacks.del(this._player_callbacks);
    this._unmount_jobs.invoke_and_clear();
  }

  protected handle_changed() {
    this.img_loader.load([{ path: this.head, w: 120, h: 120 }], 0)
  }

  override update(dt: number): void {
    this._opacity.update(dt);
    if (this.hints_node) this.hints_node.opacity = this._opacity.value;

    switch (this.gpl?.state!) {
      case GamePrepareState.Player:
        this.hints_node!.visible = !this.player.joined;
        this.node.img_idx.value = this.player.joined ? -1 : 0;
        this.countdown_node!.visible = false;
        break;
      case GamePrepareState.CountingDown:
        this.hints_node!.visible = false;
        this.node.img_idx.value = this.player.joined ? -1 : 0;
        this.countdown_node!.visible = !this.player.joined;
        break;
      case GamePrepareState.ComNumberSel:
        this.node.img_idx.value = this.player.joined ? -1 : 0;
        this.hints_node!.visible = false;
        this.countdown_node!.visible = false;
        break;
      case GamePrepareState.Computer:
        this.hints_node!.visible = !this.player.joined && this.player.is_com;
        this.node.img_idx.value = this.player.joined ? -1 : 0;
        this.countdown_node!.visible = false;
        break;
      case GamePrepareState.GameSetting:
        this.node.img_idx.value = this.player.joined ? -1 : 0;
        this.hints_node!.visible = false;
        this.countdown_node!.visible = false;
        break;
    }
  }
}
