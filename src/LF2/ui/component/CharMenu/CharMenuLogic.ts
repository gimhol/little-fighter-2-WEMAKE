import { ILf2Callback } from "@/LF2/ILf2Callback";
import { new_id } from "@/LF2/base";
import FSM from "@/LF2/base/FSM";
import { Randoming } from "@/LF2/helper";
import { between, max, min } from "@/LF2/utils";
import { PlayerInfo } from "../../../PlayerInfo";
import { CheatType, EntityGroup, IEntityData, TeamEnum } from "../../../defines";
import { Defines } from "../../../defines/defines";
import { IUIKeyEvent } from "../../IUIKeyEvent";
import { CharMenuHead } from "../CharMenuHead";
import { FighterName as CharMenuFighterName } from "../FighterName";
import { PlayerName as CharMenuPlayerName } from "../PlayerName";
import { PlayerTeamName as CharMenuPlayerTeamName } from "../PlayerTeamName";
import { UIComponent } from "../UIComponent";
import { CharMenuState } from "./CharMenuState";
import { CharMenuState_ComNumSel } from "./CharMenuState_ComNumSel";
import { CharMenuState_ComSel } from "./CharMenuState_ComSel";
import { CharMenuState_CountingDown } from "./CharMenuState_CountingDown";
import { CharMenuState_GameSetting } from "./CharMenuState_GameSetting";
import { CharMenuState_PlayerSel } from "./CharMenuState_PlayerSel";
import { ICharMenuState } from "./ICharMenuState";
import { ISlotPack } from "./ISlotPack";
import { SlotState } from "./SlotState";
import { SlotStep } from "./SlotStep";

/**
 * 角色选择逻辑
 *
 * @export
 * @class CharMenuLogic
 * @extends {UIComponent}
 */
export class CharMenuLogic extends UIComponent {
  static override readonly TAG = "CharMenuLogic";
  readonly prev_players = new Map<PlayerInfo, SlotState>()
  readonly players = new Map<PlayerInfo, SlotState>()
  protected _count_down: number = 5000;
  protected _randoming?: Randoming<IEntityData>;
  com_num: number = 0;

  get max_player(): number { return this.props.num('max_player') ?? 8 }
  set max_player(v: number) { this.props.set_num('max_player', v) }

  get min_player(): number { return this.props.num('min_player') ?? 8 }
  set min_player(v: number) { this.props.set_num('min_player', v) }

  get max_coms(): number { return Math.max(0, this.max_player - this.players.size) }
  get min_coms(): number { return Math.max(0, this.min_player - this.players.size) }

  get teams(): string[] { return this.props.strs("teams") ?? Defines.Teams.map(v => v.toString()) }
  set teams(v: string[]) { this.props.set_strs("teams", v) }

  get fighters() {
    return this.lf2.is_cheat(CheatType.LF2_NET)
      ? this.lf2.datas.fighters
      : this.lf2.datas.get_fighters_not_in_group(EntityGroup.Hidden);
  }
  protected _lf2_callbacks: ILf2Callback = {
    on_cheat_changed: (cheat_name, enabled) => {
      if (cheat_name === CheatType.LF2_NET && !enabled)
        this.handle_fighters_hidden();
    },
    on_broadcast: (message) => {
      if (message === 'reset_gpl') return this.reset();
      if (message === 'update_random') return this.update_random();
    }
  }
  slots: ISlotPack[] = []
  override on_start(): void {
    super.on_start?.();
    this._randoming = new Randoming(this.lf2.datas.find_group(EntityGroup.Regular).characters, this.lf2)
    this.lf2.callbacks.add(this._lf2_callbacks)
    const heads = this.node.search_components(CharMenuHead)
    const p_nam = this.node.search_components(CharMenuPlayerName)
    const f_nam = this.node.search_components(CharMenuFighterName)
    const t_nam = this.node.search_components(CharMenuPlayerTeamName)
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
      this.slots.push(e)
    }
  }

  override on_stop(): void {
    super.on_stop?.();
    this.lf2.callbacks.del(this._lf2_callbacks)
  }
  override on_key_down(e: IUIKeyEvent): void {
    this.fsm.state?.on_key_down?.(e)
  }
  reset() {
    this.prev_players.clear()
    for (const [k, v] of this.players)
      this.prev_players.set(k, v);
    this.players.clear();
    this.update_slots()
    this.fsm.use(CharMenuState.PlayerSel)
  }
  update_random() {
    for (const [_, state] of this.players) {
      if (!state.random) continue;
      state.fighter = this._randoming?.take() ?? null
    }
    this.update_slots()
  }
  update_slots() {
    const { slots: slots } = this;
    const players = Array.from(this.players.entries())
    for (let i = 0; i < slots.length; i++) {
      const { head, player_name, fighter_name, team_name } = slots[i];
      const ps = players.at(i)
      if (ps) {
        const [player, state] = ps
        const { is_com } = player;
        const random_confirm = this.fsm.state?.key === CharMenuState.GameSetting
        if (head) {
          if (state.random && !random_confirm) head.set_head(Defines.BuiltIn_Imgs.RFACE)
          else if (state.fighter) head.set_head(state.fighter.base.head ?? Defines.BuiltIn_Imgs.RFACE)
        }
        if (player_name) {
          player_name.join(player.name, is_com, true)
        }
        if (fighter_name) {
          const decided = state.step > SlotStep.FighterSel
          if (state.random && !random_confirm) fighter_name.join(this.lf2.string('Random'), is_com, decided)
          else if (state.fighter) fighter_name.join(this.lf2.string(state.fighter.base.name) || "noname", is_com, decided)
        }
        if (team_name) {
          if (state.step >= SlotStep.TeamSel) {
            const team_info = Defines.TeamInfoMap[state.team]
            const team_txt = this.lf2.string(team_info?.i18n ?? state.team)
            team_name.join(team_txt, is_com, state.step > SlotStep.TeamSel)
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
  press_a(player: PlayerInfo) {
    const state = this.players.get(player)
    if (!state && this.max_player <= this.players.size)
      return;
    if (!state) {
      const slot_state = this.prev_players.get(player) ?? new SlotState({
        team: this.teams[0] ?? TeamEnum.Independent,
        fighter: this._randoming?.take() ?? null
      })
      slot_state.step = SlotStep.FighterSel;
      this.prev_players.delete(player)
      this.players.set(player, slot_state);
    } else if (state.step < SlotStep.Ready) {
      if (state.step + 1 === SlotStep.TeamSel && this.teams.length < 1)
        state.step = SlotStep.Ready
      else
        state.step = min(state.step + 1, SlotStep.Ready)
    } else return;

    this.lf2.sounds.play_preset("join");
    this.update_slots()
  }
  get is_player_sel(): boolean { return this.fsm.state?.key === CharMenuState.PlayerSel }
  press_j(player: PlayerInfo) {
    const state = this.players.get(player)
    if (!state) { if (this.is_player_sel) this.lf2.pop_ui(); }
    else if (state.step <= SlotStep.FighterSel) this.players.delete(player);
    else state.step = max(state.step - 1, SlotStep.FighterSel)
    this.lf2.sounds.play_preset("cancel");
    this.update_slots()
  }

  press_lr(player: PlayerInfo, dir: 1 | -1) {
    const state = this.players.get(player)
    if (!state) return;
    if (state.step === SlotStep.FighterSel) {
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
          state.fighter = this._randoming?.take() ?? null;
        }
      }
    } else if (state.step === SlotStep.TeamSel) {
      const { teams } = this;
      const len = teams.length
      const next_idx = (len + teams.indexOf(state.team) + dir) % len;
      state.team = teams[next_idx]
    }
    this.update_slots()
  }

  press_u(player: PlayerInfo) {
    const state = this.players.get(player)
    if (state?.step !== SlotStep.FighterSel) return
    state.random = true;
    state.fighter = this._randoming?.take() ?? null;
    this.update_slots();

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
    this.update_slots()
  }
  override update(dt: number): void {
    this.fsm.update(dt)
  }
  readonly fsm = new FSM<CharMenuState, ICharMenuState>().add(
    new CharMenuState_PlayerSel(this),
    new CharMenuState_CountingDown(this),
    new CharMenuState_ComNumSel(this),
    new CharMenuState_ComSel(this),
    new CharMenuState_GameSetting(this),
  ).use(CharMenuState.PlayerSel)

  last_player(): [PlayerInfo, SlotState] | undefined {
    const pairs = Array.from(this.players.entries())
    return pairs.at(pairs.length - 1)
  }
  last_com(): [PlayerInfo, SlotState] | undefined {
    const ret = this.last_player();
    if (!ret?.[0].is_com) return void 0;
    return ret;
  }
  add_com() {
    if (this.max_player <= this.players.size) return;
    let com: PlayerInfo | null = null
    for (const [_, p] of this.lf2.players) {
      if (!p.is_com) continue;
      if (p.is_com && this.players.has(p)) continue;
      com = p;
    }
    if (!com) {
      com = new PlayerInfo(`com_` + new_id(), "com", false)
      com.set_is_com(true, false);
      this.lf2.players.set(com.id, com)
    }
    this.press_a(com)
  }
}

