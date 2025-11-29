import type { PlayerInfo } from "../../PlayerInfo";
import FSM, { IState } from "../../base/FSM";
import Invoker from "../../base/Invoker";
import { CheatType, EntityGroup } from "../../defines";
import { Defines } from "../../defines/defines";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { GamePrepareLogic, GamePrepareState } from "./GamePrepareLogic";
import { UIComponent } from "./UIComponent";
export enum SlotSelStatus {
  Empty = 'Empty',
  Fighter = 'Fighter',
  Team = 'Team',
  Ready = 'Ready',
}

interface IStateUnit extends IState<SlotSelStatus> {
  on_player_key_down?(e: IUIKeyEvent): void;
}

/**
 * 角色选择逻辑
 *
 * @export
 * @class CharacterSelLogic
 * @extends {UIComponent}
 */
export class SlotSelLogic extends UIComponent {
  static override readonly TAG = "SlotSelLogic";

  get player_id(): string { return this.args[0] || ""; }
  get player(): PlayerInfo { return this.lf2.players.get(this.player_id)! }
  get character(): string { return this.player.character; }
  set character(v: string) { this.player.set_character(v, true); this.debug('setter:character', v) }
  get character_decided() { return this.player.character_decided; }
  set character_decided(v: boolean) { this.player.set_character_decided(v, true); this.debug('setter:character_decided', v) }
  get team_decided(): boolean { return this.player.team_decided; }
  set team_decided(v: boolean) { this.player.set_team_decided(v, true); this.debug('setter:team_decided', v) }
  get team(): string { return this.player.team; }
  set team(v: string) { this.player.set_team(v, true); this.debug('setter:is_com', v) }
  get joined(): boolean { return this.player.joined; }
  set joined(v: boolean) { this.player.set_joined(v, true); this.debug('setter:joined', v) }
  get is_com(): boolean { return this.player.is_com; }
  set is_com(v: boolean) { this.player.set_is_com(v, true); this.debug('setter:is_com', v) }
  protected _unmount_jobs = new Invoker();

  get gpl() {
    return this.node.root.find_component(GamePrepareLogic)!;
  }

  readonly fsm = new FSM<SlotSelStatus, IStateUnit>().add({
    key: SlotSelStatus.Empty,
    enter: () => {
      this.joined = false;
      this.team_decided = false;
      this.character_decided = false;
      if (this.gpl.state !== GamePrepareState.Computer) this.is_com = false;
      this.player.set_random_character('', true)
    },
    on_player_key_down: (e) => {
      if (this.player_id != e.player && this.gpl.handling_com !== this) return;
      if (e.game_key === 'a') {
        this.fsm.use(SlotSelStatus.Fighter);
        this.lf2.sounds.play_preset("join");
        e.stop_immediate_propagation()
      }
    },
  }, {
    key: SlotSelStatus.Fighter,
    enter: () => {
      this.joined = true
      this.character_decided = false
      this.team_decided = false;
    },
    on_player_key_down: (e) => {
      if (this.player_id != e.player && this.gpl.handling_com !== this) return;
      if (e.game_key === "j") this.lf2.sounds.play_preset("cancel");
      if (e.game_key === "a") this.lf2.sounds.play_preset("join");
      if (e.game_key === 'a') {
        // 按攻击确认角色,
        this.character_decided = true;
        // 闯关模式下，直接确定为第一队
        if (this.gpl.game_mode === "stage_mode") {
          this.team = Defines.TeamEnum.Team_1;
          this.fsm.use(SlotSelStatus.Ready)
        } else {
          this.fsm.use(SlotSelStatus.Team)
        }
        e.stop_immediate_propagation()
      } else if (e.game_key === 'j') {
        // 按跳跃取消加入
        this.fsm.use(SlotSelStatus.Empty);
        if (this.gpl.handling_com === this) {
          this.gpl.handle_prev_com()
        }
        e.stop_immediate_propagation()
      } else {
        this.swtich_fighter(e);
      }
    },
  }, {
    key: SlotSelStatus.Team,
    enter: () => {
      this.joined = true
      this.character_decided = true
      this.team_decided = false;
    }, on_player_key_down: (e) => {
      if (this.player_id != e.player && this.gpl.handling_com !== this) return;
      if (e.game_key === "j") this.lf2.sounds.play_preset("cancel");
      if (e.game_key === "a") this.lf2.sounds.play_preset("join");
      if ("a" === e.game_key) {
        this.fsm.use(SlotSelStatus.Ready);
        e.stop_immediate_propagation()
      } else if ("j" === e.game_key) {
        this.fsm.use(SlotSelStatus.Fighter);
        e.stop_immediate_propagation()
      } else {
        this.switch_team(e);
      }
    },
  }, {
    key: SlotSelStatus.Ready,
    enter: () => {
      this.joined = true
      this.character_decided = true
      this.team_decided = true;
      if (this.gpl.handling_com === this) this.gpl.handle_next_com()
    }, on_player_key_down: (e) => {
      if (this.player_id != e.player && this.gpl.handling_com !== this) return;
      if (e.game_key === "j") {
        e.stop_immediate_propagation()
        this.lf2.sounds.play_preset("cancel");
        if (this.gpl.game_mode === "stage_mode") {
          this.fsm.use(SlotSelStatus.Fighter)
        } else {
          this.fsm.use(SlotSelStatus.Team)
        }
      }
    },
  });

  private swtich_fighter(e: IUIKeyEvent) {
    if ("D" === e.game_key || "U" === e.game_key) {
      // 按上或下,回到随机
      this.character = "";
      e.stop_immediate_propagation()
    } else if ("L" === e.game_key) {
      // 上一个角色
      const { characters } = this;
      const idx = characters.findIndex((v) => v.id === this.character);
      const next = idx <= -1 ? characters.length - 1 : idx - 1;
      this.character = characters[next]?.id ?? "";
      e.stop_immediate_propagation()
    } else if ("R" === e.game_key) {
      // 下一个角色
      const { characters } = this;
      const idx = characters.findIndex((v) => v.id === this.character);
      const next = idx >= characters.length - 1 ? -1 : idx + 1;
      this.character = characters[next]?.id ?? "";
      e.stop_immediate_propagation()
    }
  }

  private switch_team(e: IUIKeyEvent) {
    if ("L" === e.game_key) {
      // 上一个队伍
      const idx = Defines.Teams.findIndex((v) => v === this.team);
      const next_idx = (idx + Defines.Teams.length - 1) % Defines.Teams.length;
      this.team = Defines.Teams[next_idx]!;
      e.stop_immediate_propagation()
    } else if ("R" === e.game_key) {
      // 下一个队伍
      const idx = Defines.Teams.findIndex((v) => v === this.team);
      const next_idx = (idx + 1) % Defines.Teams.length;
      this.team = Defines.Teams[next_idx]!;
      e.stop_immediate_propagation()
    }
  }

  override on_start(): void {
    this.fsm.callbacks.add({
      on_state_changed: (fsm) => this.debug('on_state_changed', `${fsm.prev_state?.key} => ${fsm.state?.key}`)
    })
    this.fsm.use(SlotSelStatus.Empty)
  }
  override on_resume(): void {
    super.on_resume();
    this._unmount_jobs.add(
      this.lf2.callbacks.add({
        on_cheat_changed: (cheat_name, enabled) => {
          // 当前选择的角色被隐藏时，让玩家选随机
          if (cheat_name === CheatType.LF2_NET && !enabled)
            this.handle_hidden_character();
        },
      }),
    );
    if (!this.lf2.is_cheat_enabled(CheatType.LF2_NET))
      this.handle_hidden_character();
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  get characters() {
    return this.lf2.is_cheat_enabled(CheatType.LF2_NET)
      ? this.lf2.datas.characters
      : this.lf2.datas.get_characters_not_in_group(EntityGroup.Hidden);
  }

  override on_key_down(e: IUIKeyEvent): void {
    if (
      this.gpl.state === GamePrepareState.Player && this.player_id == e.player ||
      this.gpl.state === GamePrepareState.Computer && this.gpl.handling_com === this
    ) this.fsm.state?.on_player_key_down?.(e)
  }
  override update(dt: number): void {
    this.fsm.update(dt)
  }
  /**
   * 当前选择的角色被隐藏时，让玩家选随机
   *
   * @protected
   */
  protected handle_hidden_character() {
    const { characters, character } = this;
    if (!character) return;
    const idx = characters.findIndex((v) => v.id === character);
    if (idx < 0) this.player.set_character("", true);
  }
}
