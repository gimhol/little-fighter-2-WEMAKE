import { ILf2Callback } from "@/LF2/ILf2Callback";
import { new_id } from "@/LF2/base";
import FSM, { IState } from "@/LF2/base/FSM";
import { Randoming } from "@/LF2/helper";
import { between, ceil, max, min } from "@/LF2/utils";
import { PlayerInfo } from "../../PlayerInfo";
import { CheatType, EntityGroup, GameKey, IEntityData, TeamEnum } from "../../defines";
import { Defines } from "../../defines/defines";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { CharMenuHead } from "./CharMenuHead";
import { FighterName as CharMenuFighterName } from "./FighterName";
import { PlayerName as CharMenuPlayerName } from "./PlayerName";
import { PlayerTeamName as CharMenuPlayerTeamName } from "./PlayerTeamName";
import { UIComponent } from "./UIComponent";
import { UINode } from "../UINode";
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
  PlayerSel = "Player",
  CountingDown = "CountingDown",
  ComNumSel = "ComNumberSel",
  Computer = "Computer",
  GameSetting = "GameSetting",
}
interface ISlotPack {
  head?: CharMenuHead,
  player_name?: CharMenuPlayerName,
  fighter_name?: CharMenuFighterName,
  team_name?: CharMenuPlayerTeamName,
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
  protected _count_down: number = 5000;
  protected _randoming?: Randoming<IEntityData>;
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
  protected _slots: ISlotPack[] = []
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
      this._slots.push(e)
    }
  }
  override on_stop(): void {
    super.on_stop?.();
    this.lf2.callbacks.del(this._lf2_callbacks)
  }
  override on_key_down(e: IUIKeyEvent): void {
    this.fsm.state?.on_key_down?.(e)
  }
  protected update_slots() {
    const { _slots: slots } = this;
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
          const decided = state.step > SLOT_STEP_FIGHTER
          if (state.random && !random_confirm) fighter_name.join(this.lf2.string('Random'), is_com, decided)
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
      const slot_state = new SlotState()
      slot_state.fighter = this._randoming?.take() ?? null;
      this.players.set(player, slot_state);
    } else if (state.step < SLOT_STEP_READY) {
      state.step = min(state.step + 1, SLOT_STEP_READY)
    } else return;
    this.lf2.sounds.play_preset("join");
    if (this.is_player_sel) {
      const all_player_ready = Array.from(this.players.values()).every(v => v.step === SLOT_STEP_READY)
      if (all_player_ready) this.fsm.use(CharMenuState.CountingDown)
    }
    this.update_slots()
  }
  get is_player_sel(): boolean { return this.fsm.state?.key === CharMenuState.PlayerSel }
  protected press_j(player: PlayerInfo) {
    const state = this.players.get(player)
    if (!state) { if (this.is_player_sel) this.lf2.pop_ui(); }
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
          state.fighter = this._randoming?.take() ?? null;
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
  readonly fsm = new FSM<CharMenuState, IGamePrepareState>().add({
    key: CharMenuState.PlayerSel,
    enter: () => {
      const coms = Array.from(this.players.keys()).filter(v => v.is_com)
      for (const com of coms) this.players.delete(com);
      this.update_slots();
    },
    on_key_down: e => {
      const player = this.lf2.players.get(e.player);
      if (!player) return;
      switch (e.game_key) {
        case GameKey.L: this.press_lr(player, -1); break;
        case GameKey.R: this.press_lr(player, +1); break;
        case GameKey.a: this.press_a(player); break;
        case GameKey.j: this.press_j(player); break;
        case GameKey.U: this.press_u(player); break;
        case GameKey.D: break;
        case GameKey.d: break;
      }
    }
  }, {
    key: CharMenuState.CountingDown,
    on_key_down: e => {
      this._count_down = max(0, this._count_down - 500)
      if (this.max_player <= this.players.size) return;
      const player = this.lf2.players.get(e.player);
      if (!player || e.game_key !== GameKey.a || this.players.has(player)) return;
      this.press_a(player);
      this.fsm.use(CharMenuState.PlayerSel)
    },
    enter: () => {
      this._count_down = 5000;
    },
    update: dt => {
      this._count_down = max(0, this._count_down - dt);
      const num = ceil(this._count_down / 1000)
      this._slots.forEach(v => v.head?.count_down(num))
      if (num > 0) return;
      return this.max_player <= this.players.size ?
        CharMenuState.GameSetting :
        CharMenuState.ComNumSel;
    },
    leave: () => {
      this._slots.forEach(v => v.head?.count_down(0))
    }
  }, new class implements IGamePrepareState {
    readonly key = CharMenuState.ComNumSel;
    readonly owner: CharMenuLogic;
    protected how_many_computer?: UINode;
    constructor(owner: CharMenuLogic) {
      this.owner = owner
    }
    enter = () => {
      this.how_many_computer = this.owner.node.root.search_child("how_many_computer")
      this.how_many_computer?.set_visible(true);
    }
    update = (dt: number) => {
      if (!this.how_many_computer) return CharMenuState.GameSetting
    }
    leave = () => {
      this.how_many_computer?.set_visible(true);
    }
  }(this), {
    key: CharMenuState.Computer,
    on_key_down: e => {
      const pair = this.last_com()
      if (e.game_key === GameKey.a) {
        if (!pair) { this.add_com(); return; }
        const [player, state] = pair
        if (!player.is_com) { this.add_com(); return; }
        if (state.step === SLOT_STEP_READY) { this.add_com(); return; }
        this.press_a(player)
        if (state.step === SLOT_STEP_READY) this.add_com()
        return;
      }
      if (!pair) return;
      const [com] = pair
      switch (e.game_key) {
        case GameKey.j: this.press_j(com); break;
        case GameKey.L: this.press_lr(com, -1); break;
        case GameKey.R: this.press_lr(com, 1); break;
        case GameKey.U: this.press_u(com); break;
        default: return;
      }
      if (!this.players.has(com)) {
        this.lf2.players.delete(com.id)
        const lc = this.last_com()
        if (!lc) this.fsm.use(CharMenuState.PlayerSel)
        else this.press_j(lc[0])
      }
    }
  }, {
    key: CharMenuState.GameSetting,
    enter: () => {
      this.update_slots()
    }
  }).use(CharMenuState.PlayerSel)

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
    const p = new PlayerInfo(new_id(), "com", false)
    p.set_is_com(true, false);
    this.lf2.players.set(p.id, p)
    this.press_a(p)
  }
}
export interface IGamePrepareState extends IState<CharMenuState> {
  on_key_down?(e: IUIKeyEvent): void;
}
