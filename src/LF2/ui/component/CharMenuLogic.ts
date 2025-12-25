import { ILf2Callback } from "@/LF2/ILf2Callback";
import { between, max, min } from "@/LF2/utils";
import type { PlayerInfo } from "../../PlayerInfo";
import { CheatType, EntityGroup, GameKey, IEntityData, TeamEnum } from "../../defines";
import { Defines } from "../../defines/defines";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { CharMenuHead } from "./CharMenuHead";
import { FighterName as CharMenuFighterName } from "./FighterName";
import { PlayerName as CharMenuPlayerName } from "./PlayerName";
import { PlayerTeamName as CharMenuPlayerTeamName } from "./PlayerTeamName";
import { UIComponent } from "./UIComponent";
const SLOT_STEP_FIGHTER = 0;
const SLOT_STEP_TEAM = 1;
const SLOT_STEP_READY = 2;
class SlotState {
  fighter: IEntityData | null = null;
  random: boolean = true;
  step: number = SLOT_STEP_FIGHTER;
  team: string = TeamEnum.Independent
}

enum CharMenuState {
  Player = "Player",
  CountingDown = "CountingDown",
  ComNumberSel = "ComNumberSel",
  Computer = "Computer",
  GameSetting = "GameSetting",
}
/**
 * 角色选择逻辑
 *
 * @export
 * @class CharMenuLogic
 * @extends {UIComponent}
 */
export class CharMenuLogic extends UIComponent {
  static override readonly TAG = "CharMenuLogic";
  readonly players = new Map<PlayerInfo, SlotState>()

  protected state = CharMenuState.Player;
  get max_player(): number { return this.props.num('max_player') ?? 8 }
  get max_coms(): number { return this.max_player - this.players.size }
  get teams(): string[] { return this.props.strs("teams") ?? Defines.Teams.map(v => v.toString()) }
  get fighters() {
    return this.lf2.is_cheat_enabled(CheatType.LF2_NET)
      ? this.lf2.datas.fighters
      : this.lf2.datas.get_fighters_not_in_group(EntityGroup.Hidden);
  }
  protected _lf2_callbacks: ILf2Callback = {
    on_cheat_changed: (cheat_name, enabled) => {
      if (cheat_name === CheatType.LF2_NET && !enabled)
        this.handle_fighters_hidden();
    }
  }
  get slots() {
    const heads = this.node.search_components(CharMenuHead)
    const p_nam = this.node.search_components(CharMenuPlayerName)
    const f_nam = this.node.search_components(CharMenuFighterName)
    const t_nam = this.node.search_components(CharMenuPlayerTeamName)
    interface ISlotPack {
      head?: CharMenuHead,
      player_name?: CharMenuPlayerName,
      fighter_name?: CharMenuFighterName,
      team_name?: CharMenuPlayerTeamName,
    }
    const ret: ISlotPack[] = []
    const len = max(
      heads.length,
      p_nam.length,
      f_nam.length,
      t_nam.length,
    )
    for (let i = 0; i < len; i++) {
      const e: ISlotPack = {
        head: heads.at(i),
        player_name: p_nam.at(i),
        fighter_name: f_nam.at(i),
        team_name: t_nam.at(i),
      }
      ret.push(e)
    }
    return ret;
  }
  override on_start(): void {
    super.on_start?.();
    this.lf2.callbacks.add(this._lf2_callbacks)
  }
  override on_stop(): void {
    super.on_stop?.();
    this.lf2.callbacks.del(this._lf2_callbacks)
  }
  override on_key_down(e: IUIKeyEvent): void {
    switch (this.state) {
      case CharMenuState.Player: {
        const player = this.lf2.players.get(e.player);
        if (!player) break;
        switch (e.game_key) {
          case GameKey.L: this.press_lr(player, -1); break;
          case GameKey.R: this.press_lr(player, 1); break;
          case GameKey.a: this.press_a(player); break;
          case GameKey.j: this.press_j(player); break;
          case GameKey.U: this.press_u(player); break;
          case GameKey.D: break;
          case GameKey.d: break;
        }
        break;
      }
      case CharMenuState.ComNumberSel:
    }
  }
  protected update_slots() {
    const { slots } = this;
    const players = Array.from(this.players.entries())
    for (let i = 0; i < slots.length; i++) {
      const { head, player_name, fighter_name, team_name } = slots[i];
      const ps = players.at(i)
      if (ps) {
        const [player, state] = ps
        const { is_com } = player;
        if (head) {
          if (state.random) head.set_head(Defines.BuiltIn_Imgs.RFACE)
          else if (state.fighter) head.set_head(state.fighter.base.head ?? Defines.BuiltIn_Imgs.RFACE)
        }
        if (player_name) {
          player_name.join(player.name, is_com, true)
        }
        if (fighter_name) {
          const decided = state.step > SLOT_STEP_FIGHTER
          if (state.random) fighter_name.join(this.lf2.string('Random'), is_com, decided)
          else if (state.fighter) fighter_name.join(state.fighter.base.name ?? "noname", is_com, decided)
        }
        if (team_name) {
          if (state.step >= SLOT_STEP_TEAM) {
            const team_info = Defines.TeamInfoMap[state.team]
            const team_txt = this.lf2.string(team_info?.i18n ?? state.team)
            team_name.join(team_txt, is_com, state.step > SLOT_STEP_TEAM)
          } else {
            team_name.quit()
          }
        }
      } else {
        if (head) head.quit();
        if (player_name) player_name.quit();
        if (fighter_name) fighter_name.quit();
        if (team_name) team_name.quit();
      }

    }
  }
  protected press_a(player: PlayerInfo) {
    const state = this.players.get(player)
    if (!state && this.max_player <= this.players.size)
      return;
    if (!state) {
      this.players.set(player, new SlotState());
    } else if (state.step < SLOT_STEP_READY) {
      state.step = min(state.step + 1, SLOT_STEP_READY)
    } else return;
    this.lf2.sounds.play_preset("join");
    Array.from(this.players.values()).every(v => v.step === SLOT_STEP_READY)
    this.update_slots()
  }
  protected press_j(player: PlayerInfo) {
    const state = this.players.get(player)
    if (!state) this.lf2.pop_ui();
    else if (state.step <= SLOT_STEP_FIGHTER) this.players.delete(player);
    else state.step = max(state.step - 1, SLOT_STEP_FIGHTER)
    this.lf2.sounds.play_preset("cancel");
    this.update_slots()
  }
  protected press_lr(player: PlayerInfo, dir: 1 | -1) {
    const state = this.players.get(player)
    if (!state) return;
    if (state.step === SLOT_STEP_FIGHTER) {
      const { fighters } = this;
      if (!fighters.length) return;

      if (state.random === true || !state.fighter) {
        state.random = false;
        state.fighter = dir < 0 ? fighters[fighters.length - 1] : fighters[0]
      } else {
        const next_idx = fighters.indexOf(state.fighter) + dir
        if (between(next_idx, 0, fighters.length - 1)) {
          state.random = false;
          state.fighter = fighters[next_idx];
        } else {
          state.random = true;
          state.fighter = null;
        }
      }
    } else if (state.step === SLOT_STEP_TEAM) {
      const { teams } = this;
      const len = teams.length
      const next_idx = (len + teams.indexOf(state.team) + dir) % len;
      state.team = teams[next_idx]
    }
    this.update_slots()
  }
  protected press_u(player: PlayerInfo) {
    const state = this.players.get(player)
    if (state?.step !== SLOT_STEP_FIGHTER) return
    state.random = true;
    state.fighter = null;
    this.update_slots()
  }

  /**
   * 当前选择的角色被隐藏时，让玩家选随机
   *
   * @protected
   */
  protected handle_fighters_hidden() {
    const { fighters } = this;
    for (const [, s] of this.players) {
      const hidden = !fighters.some(v => v === s.fighter)
      if (!hidden) continue;
      s.random = true;
      s.fighter = null;
    }
  }
}
