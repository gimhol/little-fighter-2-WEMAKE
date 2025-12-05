import { new_team } from "../../base";
import FSM, { IState } from "../../base/FSM";
import Invoker from "../../base/Invoker";
import LocalController from "../../controller/LocalController";
import { EntityGroup, FacingFlag } from "../../defines";
import { Defines } from "../../defines/defines";
import { Entity } from "../../entity/Entity";
import { Factory } from "../../entity/Factory";
import { ceil, max } from "../../utils";
import { map_no_void } from "../../utils/container_help/map_no_void";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { BackgroundNameText } from "./BackgroundNameText";
import { IUICompnentCallbacks } from "./IUICompnentCallbacks";
import { SlotSelLogic, SlotSelStatus } from "./SlotSelLogic";
import { StageNameText } from "./StageNameText";
import { UIComponent } from "./UIComponent";

export interface IGamePrepareLogicCallback extends IUICompnentCallbacks {
  on_countdown?(v: number): void;
}
export enum GamePrepareState {
  Player = "Player",
  CountingDown = "CountingDown",
  ComNumberSel = "ComNumberSel",
  Computer = "Computer",
  GameSetting = "GameSetting",
}

export interface IGamePrepareState extends IState<GamePrepareState> {
  on_player_key_down?(e: IUIKeyEvent): void
}

export class GamePrepareLogic extends UIComponent<IGamePrepareLogicCallback> {
  static override readonly TAG = 'GamePrepareLogic'
  get game_mode(): string { return this.args[0] || ''; }
  protected _unmount_jobs = new Invoker();
  get state(): GamePrepareState {
    return this.fsm.state?.key!;
  }

  private _count_down: number = 5000;


  override on_resume(): void {
    super.on_resume();
    const background_row = this.node.search_child("background_row")!;
    const stage_row = this.node.search_child("stage_row")!;
    if (this.game_mode === "stage_mode") {
      stage_row.set_visible(true).set_disabled(false);
      background_row.set_visible(false).set_disabled(true);
    } else {
      background_row.set_visible(true).set_disabled(false);
      stage_row.set_visible(false).set_disabled(true);
    }

    // this.fsm.use(GamePrepareState.Player);
    this._unmount_jobs.add(
      ...map_no_void(this.lf2.players.values(), (v) =>
        v.callbacks.add({
          on_joined_changed: () => this.on_someone_changed(),
          on_team_decided: () => this.on_someone_changed(),
        }),
      ),
      this.lf2.callbacks.add({
        on_broadcast: (m) => {
          if (m === Defines.BuiltIn_Broadcast.ResetGPL)
            this.fsm.use(GamePrepareState.Player);
          if (m === Defines.BuiltIn_Broadcast.UpdateRandom)
            this.update_random();
          if (m === Defines.BuiltIn_Broadcast.StartGame) this.start_game();
        },
      }),
    );
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  override on_key_down(e: IUIKeyEvent): void {
    this.fsm.state?.on_player_key_down?.(e)
  }

  protected on_someone_changed() {
    let joined_num = 0;
    let ready_num = 0;
    for (const [, p] of this.lf2.players) {
      if (p.joined || p.is_com) joined_num += 1; // 已加入人数
      if (p.team_decided) ready_num += 1; // 已准备人数
    }
    if (ready_num && ready_num === joined_num) {
      if (this.state === GamePrepareState.Computer) {
        this.fsm.use(GamePrepareState.GameSetting);
      } else if (this.state === GamePrepareState.Player) {
        this.fsm.use(GamePrepareState.CountingDown);
      }
    } else if (ready_num < joined_num) {
      if (this.state === GamePrepareState.CountingDown) {
        this.fsm.use(GamePrepareState.Player);
      }
    }
  }

  override update(dt: number): void {
    this.fsm.update(dt);
  }

  readonly fsm = new FSM<GamePrepareState, IGamePrepareState>().add({
    key: GamePrepareState.Player,
    enter: () => {
      this.handling_com = void 0;
      this._com_num = 0;

      // 清空已选的com
      for (const slot of this.coms)
        slot.fsm.use(SlotSelStatus.Empty)

      // ready状态
      for (const slot of this.joined_players)
        if (slot.fsm.state?.key === SlotSelStatus.Ready)
          slot.fsm.use(SlotSelStatus.Fighter)
    },
    on_player_key_down: (e) => {
      if ("j" === e.game_key && !this.joined_slots.length) {
        this.lf2.pop_ui();
        e.stop_immediate_propagation()
      }
    },
  }, {
    key: GamePrepareState.CountingDown,
    enter: () => {
      this._count_down = 5000;
      this.callbacks.emit("on_countdown")(ceil(this._count_down / 1000));
    },
    update: (dt) => {
      const prev_second = ceil(this._count_down / 1000);
      this._count_down -= dt;
      const curr_second = ceil(this._count_down / 1000);
      if (curr_second !== prev_second)
        this.callbacks.emit("on_countdown")(curr_second);
      if (this._count_down <= 0)
        if (this.empty_slots.length)
          return GamePrepareState.ComNumberSel;
        else
          return GamePrepareState.GameSetting;
    },
    on_player_key_down: (e) => {
      const player = this.lf2.players.get(e.player)
      if ("j" === e.game_key) {
        this._count_down = max(0, this._count_down - 500);
        this.callbacks.emit("on_countdown")(ceil(this._count_down / 1000));
        e.stop_immediate_propagation()
      }
      if ("a" === e.game_key && (!player?.joined || player?.is_com)) {
        this.fsm.use(GamePrepareState.Player)
        e.stop_immediate_propagation()
      }
    },
  }, {
    key: GamePrepareState.ComNumberSel,
    enter: () => {
      for (const c of this.coms) {
        c.fsm.use(SlotSelStatus.Empty)
      }
      const joined_num = this.joined_slots.length;
      const not_joined_num = this.empty_slots.length;

      if (this.game_mode !== "stage_mode")
        this._min_com_num = joined_num <= 1 ? 1 : 0;

      this._max_com_num = not_joined_num;
      this.node.find_child("how_many_computer")?.set_visible(true);
    },
    leave: () => {
      this.node.find_child("how_many_computer")?.set_visible(false)
    },
    on_player_key_down: (e) => {
      if ("d" === e.game_key) {
        this.fsm.use(GamePrepareState.Player);
        e.stop_immediate_propagation()
      }
    },
  }, {
    key: GamePrepareState.Computer,
    enter: () => {
      this.handling_com = this.coms[0];
      this.handling_com?.fsm.use(SlotSelStatus.Fighter);
    }
  }, {
    key: GamePrepareState.GameSetting,
    enter: () => {
      this.update_random();
      this.node.find_child("menu")?.set_visible(true);
    },
    leave: () => {
      for (const { player: p } of this.slots)
        p?.set_random_character("", true);
      this.node.find_child("menu")?.set_visible(false);
    },
    on_player_key_down: (e) => {
      if ("d" === e.game_key) {
        this.fsm.use(GamePrepareState.Player);
        e.stop_immediate_propagation()
      }
    },
  }).use(GamePrepareState.Player);

  /** 至少可选COM数量 */
  private _min_com_num = 0;
  /** 至多可选COM数量 */
  private _max_com_num = 7;
  /** 指定选COM数量 */
  private _com_num = 0;

  private update_random() {
    for (const { player: p } of this.slots) {
      if (!p?.joined || !p.is_random) continue;
      const { characters } = this.lf2.datas.find_group(EntityGroup.Regular);
      const { character } = p
      const remains = character ? characters.filter(v => v.id !== character) : characters
      if (remains.length < 0) continue;
      const next = this.lf2.random_get(remains)
      if (!next) continue;
      p.set_random_character(next.id, true);
    }
  }

  /** 至少可选COM数量 */
  get min_com_num(): number {
    return this._min_com_num;
  }
  /** 至多可选COM数量 */
  get max_com_num(): number {
    return this._max_com_num;
  }
  /** 指定选COM数量 */
  get com_num(): number {
    return this._com_num;
  }

  /** 全部“玩家槽” */
  get slots(): SlotSelLogic[] { return this.node.search_components(SlotSelLogic) }

  /** 已加入的“电脑槽” */
  get joined_coms(): SlotSelLogic[] {
    return this.node.search_components(SlotSelLogic, v => v.is_com && v.joined)
  }
  get joined_players(): SlotSelLogic[] {
    return this.node.search_components(SlotSelLogic, v => !v.is_com && v.joined)
  }
  /** 电脑槽 */
  get coms(): SlotSelLogic[] {
    return this.node.search_components(SlotSelLogic, v => v.is_com);
  }

  /** 已使用槽 */
  get joined_slots(): SlotSelLogic[] {
    return this.node.search_components(SlotSelLogic, v => v.joined);
  }

  /** 未使用槽 */
  get empty_slots(): SlotSelLogic[] {
    return this.node.search_components(SlotSelLogic, v => !v.joined);
  }

  handling_com: SlotSelLogic | undefined;

  set_com_num(num: number) {
    this._com_num = num;
    const { empty_slots } = this;

    for (const c of empty_slots) c.is_com = false;

    while (num && empty_slots.length) {
      empty_slots.shift()!.is_com = true;
      --num;
    }
    if (this._com_num > 0) {
      this.fsm.use(GamePrepareState.Computer);
    } else {
      this.fsm.use(GamePrepareState.GameSetting);
    }
  }

  handle_next_com() {
    const { coms } = this
    const idx = this.handling_com ? coms.indexOf(this.handling_com) : -1
    this.handling_com = coms[idx + 1];
    if (!this.handling_com) this.fsm.use(GamePrepareState.GameSetting)
    else this.handling_com.fsm.use(SlotSelStatus.Fighter)
  }
  handle_prev_com() {
    const { coms } = this
    const idx = this.handling_com ? coms.indexOf(this.handling_com) : 0
    this.handling_com = coms[idx - 1];
    if (!this.handling_com) this.fsm.use(GamePrepareState.ComNumberSel)
  }
  start_game() {
    const { far, near, left, right } = this.lf2.world.bg;

    for (const { player } of this.slots) {
      if (!player?.joined) continue;
      const character_data = this.lf2.datas.find_character(player.character);
      if (!character_data) continue;
      const character = new Entity(this.world, character_data);
      character.name = player.is_com ? "com" : player.name;
      character.team = player.team || new_team();
      character.facing = this.lf2.random_get([FacingFlag.Left, FacingFlag.Right])!;

      if (player.is_com) {
        character.ctrl = Factory.inst.get_ctrl(
          character_data.id,
          player.id,
          character
        );
      } else {
        character.ctrl = new LocalController(
          player.id,
          character,
          player.keys,
        );
      }
      character.position.z = this.lf2.random_in(far, near);
      character.position.x = this.lf2.random_in(left, right);
      character.blinking = this.world.begin_blink_time;
      character.attach();
    }

    const stage_name_text = this.node.root.search_component(
      StageNameText,
      (v) => v.node.visible && !v.node.disabled,
    );
    const background_name_text = this.node.root.search_component(
      BackgroundNameText,
      (v) => v.node.visible && !v.node.disabled,
    );
    if (stage_name_text) this.lf2.change_stage(stage_name_text.stage);
    else if (background_name_text) this.lf2.change_bg(background_name_text.background);
    if (stage_name_text) this.lf2.push_ui("stage_mode_page");
    else this.lf2.push_ui("vs_mode_page");
  }

  override on_stop(): void {
    this.lf2.change_stage(Defines.VOID_STAGE)
    this.lf2.change_bg(Defines.VOID_BG)
  }
}

