import { arithmetic_progression, ComponentsPlayer, FacingFlag, IStageInfo, IStagePhaseInfo, IWorldCallbacks, Jalousie, Label, LF2, Randoming, Stage, StageActions, StageGroup, UINode } from "@/LF2";
import FSM from "@/LF2/base/FSM";
import { Entity } from "@/LF2/entity";
import { StatBarType } from "@/LF2/entity/StatBarType";
import IStageCallbacks from "@/LF2/stage/IStageCallbacks";
import { Times } from "@/LF2/utils/Times";
import { new_team } from "../../base";
import { Defines, EntityGroup, GameKey } from "../../defines";
import IEntityCallbacks from "../../entity/IEntityCallbacks";
import { is_fighter } from "../../entity/type_check";
import { IPropsMeta, traversal } from "../../utils";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { CameraCtrl } from "./CameraCtrl";
import { ComponentFSMState } from "./ComponentFSMState";
import { FighterStatBar } from "./FighterStatBar";
import { UIComponent } from "./UIComponent";
class FSMState extends ComponentFSMState<number, DemoModeLogic> {
  override readonly key: number = 0
  get fsm() { return this.owner.fsm }
}
class FSMState_BeforeEnd extends FSMState {
  override readonly key: number = 1;
  override update() {
    if (this.fsm.state_time > 3000)
      return 2;
  }
}
class FSMState_End extends FSMState {
  override readonly key: number = 2;
  override enter(): void {
    this.lf2.sounds.play_preset("end");
    this.owner.props.score_board?.set_visible(true);
  }
  override leave(): void {
    this.owner.props.score_board?.set_visible(false);
  }
}
class FSMState_BeforeWin extends FSMState {
  override readonly key: number = 3;
  override update() {
    if (this.fsm.state_time > 3000)
      return 4;
  }
}
class FSMState_Win extends FSMState {
  override readonly key: number = 4;
  override enter(): void {
    this.lf2.sounds.play_preset("pass");
    const score_board = this.node.find_child("score_board")
    score_board?.set_visible(true);
  }
  override leave(): void {
    const score_board = this.node.find_child("score_board")
    score_board?.set_visible(false);
  }
}
export interface IDemoModeLogicProps {
  focus_prefix?: Label;
  focus_on?: Label;
  cam_ctrl?: CameraCtrl;
  score_board?: UINode;
}
interface DemoSituation {
  title: string;
  player_count: number;
  stage_mode: boolean;
  player_teams: string[]
}
export class DemoModeLogic extends UIComponent<IDemoModeLogicProps> {
  static override readonly TAGS: string[] = ["DemoModeLogic"];
  static override readonly PROPS: IPropsMeta<IDemoModeLogicProps> = {
    focus_prefix: Label,
    focus_on: Label,
    cam_ctrl: CameraCtrl,
    score_board: UINode,
  };
  readonly fsm = new FSM<number, FSMState>().add(
    new FSMState(this),
    new FSMState_BeforeEnd(this),
    new FSMState_End(this),
    new FSMState_BeforeWin(this),
    new FSMState_Win(this)
  )
  protected _staring?: Entity | undefined;
  protected _free?: boolean
  protected weapon_drop_timer = new Times(0, 1200);
  jalousie?: Jalousie;
  gogogo?: ComponentsPlayer;
  gogogo_loop?: ComponentsPlayer;
  protected static _situations: Randoming<DemoSituation> | null = null
  protected static _situation: DemoSituation | null = null
  protected static _stages: Randoming<IStageInfo> | null = null
  protected static get_situations(lf2: LF2) {
    if (this._situations) return this._situations;
    return this._situations = new Randoming<DemoSituation>([
      /* 闯关 */
      { title: '1 Players Stage Mode', player_count: 1, stage_mode: true, player_teams: new Array(1).fill('1') },
      { title: '2 Players Stage Mode', player_count: 2, stage_mode: true, player_teams: new Array(2).fill('1') },
      { title: '3 Players Stage Mode', player_count: 3, stage_mode: true, player_teams: new Array(3).fill('1') },
      { title: '4 Players Stage Mode', player_count: 4, stage_mode: true, player_teams: new Array(4).fill('1') },
      { title: '5 Players Stage Mode', player_count: 5, stage_mode: true, player_teams: new Array(5).fill('1') },
      { title: '6 Players Stage Mode', player_count: 6, stage_mode: true, player_teams: new Array(6).fill('1') },
      { title: '7 Players Stage Mode', player_count: 7, stage_mode: true, player_teams: new Array(7).fill('1') },
      { title: '8 Players Stage Mode', player_count: 8, stage_mode: true, player_teams: new Array(8).fill('1') },

      /* 各自为战 */
      { title: '2 Players, VS Mode', player_count: 2, stage_mode: false, player_teams: arithmetic_progression(1, 2).map(v => '' + v) },
      { title: '3 Players, VS Mode', player_count: 3, stage_mode: false, player_teams: arithmetic_progression(1, 3).map(v => '' + v) },
      { title: '4 Players, VS Mode', player_count: 4, stage_mode: false, player_teams: arithmetic_progression(1, 4).map(v => '' + v) },
      { title: '5 Players, VS Mode', player_count: 5, stage_mode: false, player_teams: arithmetic_progression(1, 5).map(v => '' + v) },
      { title: '6 Players, VS Mode', player_count: 6, stage_mode: false, player_teams: arithmetic_progression(1, 6).map(v => '' + v) },
      { title: '7 Players, VS Mode', player_count: 7, stage_mode: false, player_teams: arithmetic_progression(1, 7).map(v => '' + v) },
      { title: '8 Players, VS Mode', player_count: 8, stage_mode: false, player_teams: arithmetic_progression(1, 8).map(v => '' + v) },

      /* 两队交战 */
      { title: "2 Teams, 4 Players, VS Mode", player_count: 4, stage_mode: false, player_teams: ['1', '1', '2', '2'] },
      { title: "3 Teams, 4 Players, VS Mode", player_count: 6, stage_mode: false, player_teams: ['1', '1', '1', '2', '2', '2'] },
      { title: "4 Teams, 4 Players, VS Mode", player_count: 8, stage_mode: false, player_teams: ['1', '1', '1', '1', '2', '2', '2', '2'] },

      /* 三队交战 */
      { title: "3 Teams, 6 Players, VS Mode", player_count: 6, stage_mode: false, player_teams: ['1', '1', '2', '2', '3', '3'] },

      /* 四队交战 */
      { title: "4 Teams, 6 Players, VS Mode", player_count: 8, stage_mode: false, player_teams: ['1', '1', '2', '2', '3', '3', '4', '4'] },
    ], lf2)
  }
  protected static get_situation(lf2: LF2) {
    if (this._situation) return this._situation;
    return this._situation = this.get_situations(lf2).take();
  }
  protected static clear_situation() {
    this._situation = null
  }
  protected static get_stages(lf2: LF2): Randoming<IStageInfo> {
    if (this._stages) return this._stages
    return this._stages = new Randoming(
      lf2.datas.stages.filter(v => {
        return (
          false != v.group?.some(v => v != StageGroup.Hidden) &&
          false != v.group?.some(v => v != StageGroup.Dev) &&
          v.is_starting
        )
      }),
      lf2
    )
  }
  get is_stage_mode(): boolean { return DemoModeLogic.get_situation(this.lf2).stage_mode }
  get is_vs_mode(): boolean { return !DemoModeLogic.get_situation(this.lf2).stage_mode }
  handle_stage_actions(actions: (string | StageActions)[]) {
    for (const action of actions) {
      switch (action) {
        case StageActions.GoGoGoRight:
          this.gogogo?.start();
          this.gogogo?.node.set_visible(true);
          break
        case StageActions.LoopGoGoGoRight:
          this.gogogo_loop?.start();
          this.gogogo_loop?.node.set_visible(true)
          break;
      }
    }
  }
  protected stage_callbacks: IStageCallbacks = {
    on_phase_changed: (
      stage: Stage,
      curr: IStagePhaseInfo | undefined,
      prev: IStagePhaseInfo | undefined,
    ) => {
      this.debug('on_phase_changed', stage, curr, prev)
      if (stage.is_chapter_finish) return;
      if (!prev) {
        this.gogogo?.stop();
        this.gogogo?.node.set_visible(false)
        this.gogogo?.node.set_opacity(0)
        this.gogogo_loop?.stop();
        this.gogogo_loop?.node.set_visible(false)
        this.gogogo_loop?.node.set_opacity(0)
      }
      const { on_end } = prev || {};
      const { on_start } = curr || {};
      if (on_end?.length) this.handle_stage_actions(on_end)
      if (on_start?.length) this.handle_stage_actions(on_start)
    },
    on_chapter_finish: (stage: Stage) => {
      this.debug('on_chapter_finish', stage)
      this.fsm.use(3)
    },
    on_requrie_goto_next_stage: (stage: Stage) => {
      this.debug('on_requrie_goto_next_stage', stage)
      if (this.jalousie) this.jalousie.open = false;
    }
  }
  override on_start(): void {
    super.on_start?.();
    this.jalousie = this.node.search_component(Jalousie)
    this.gogogo = this.node.search_component(ComponentsPlayer, "play_gogogo")
    this.gogogo_loop = this.node.search_component(ComponentsPlayer, "play_gogogo_loop")
    this.fsm.use(0)
    this.node.search_node("curr_focus")!.visible = false

    let stage: IStageInfo | undefined
    if (this.is_stage_mode) {
      stage = DemoModeLogic.get_stages(this.lf2).take()
      this.lf2.change_bg(stage?.bg ?? '?');
    } else {
      const bg = this.lf2.mt.pick(this.lf2.datas.backgrounds)
      this.lf2.change_bg(bg?.id || '?')
    }
    const fighters_datas = this.lf2.datas.get_characters_of_group(
      EntityGroup.Regular,
    );
    const boss_datas = this.lf2.datas.get_characters_of_group(
      EntityGroup.Boss,
    );

    this.world.paused = false;
    const { far, near, left, right } = this.lf2.world.bg;
    const { is_stage_mode, is_vs_mode } = this;
    if (is_vs_mode) this.lf2.sounds.play_bgm('?');
    else fighters_datas.push(...boss_datas)

    let cam_x = is_stage_mode ? 0 : this.lf2.mt.range(left, right - Defines.MODERN_SCREEN_WIDTH)

    const situation = DemoModeLogic.get_situation(this.lf2);
    const { player_count, player_teams } = situation
    const player_infos = Array.from(this.lf2.players.values());
    for (let i = 0; i < player_count; i++) {
      const player = player_infos[i]!;
      if (!player) continue;

      const fighter_data = this.lf2.mt.take(fighters_datas);
      if (!fighter_data) continue;

      const fighter = this.lf2.factory.create_entity(this.world, fighter_data);
      if (!fighter) return;
      fighter.team = player_teams.shift() ?? new_team();
      fighter.facing = is_stage_mode ?
        FacingFlag.Right :
        this.lf2.mt.pick([FacingFlag.Left, FacingFlag.Right])!;

      fighter.ctrl = this.lf2.factory.create_ctrl(fighter_data.id, player.id, fighter);
      fighter.key_role = true;
      fighter.name_visible = true;
      fighter.stat_bar_type = StatBarType.UI;
      fighter.ctrl = this.lf2.factory.create_ctrl(
        fighter_data.id,
        player.id,
        fighter,
      );
      const x = this.is_stage_mode ?
        this.lf2.mt.range(
          (cam_x + 40),
          (cam_x + 80)
        ) : this.lf2.mt.range(
          (cam_x + 1 * Defines.MODERN_SCREEN_WIDTH / 3),
          (cam_x + 2 * Defines.MODERN_SCREEN_WIDTH / 3)
        )
      fighter.set_position(x, void 0, this.lf2.mt.range(far, near))
      fighter.blinking = this.world.begin_blink_time;
      if (is_vs_mode) fighter.mp = (fighter.mp_max * 2 / 5)
      fighter.attach();
    }

    const stat_bars = this.node.search_components(FighterStatBar)
    for (let i = 0; i < stat_bars.length; i++) {
      const stat_bar = stat_bars[i];
      const enabled = player_count >= Number(stat_bar.node.id?.match(/p(\d)_stat/)?.[1]);
      stat_bar.node.visible = enabled;
      stat_bar.node.disabled = !enabled;
      if (enabled) continue;
      stat_bars.splice(i, 1);
      --i;
    }

    for (const [, fighter] of this.world.puppets) {
      if (!fighter) continue;
      const stat_bar = stat_bars.shift()
      if (!stat_bar) break;
      stat_bar.set_entity(fighter)
    }

    for (const [, f] of this.world.puppets) {
      this.world_callbacks.on_fighter_add?.(f)
    }
    if (is_stage_mode && stage) {
      this.lf2.change_stage(stage.id);
      this.lf2.world.stage.callbacks.add(this.stage_callbacks);
    }
    this.lf2.world.callbacks.add(this.world_callbacks);
    this.node.find_component(CameraCtrl)?.focus_next(1)
  }
  override on_stop(): void {
    super.on_stop?.();
    DemoModeLogic.clear_situation()
    this.lf2.world.stage.callbacks.del(this.stage_callbacks)
    this.lf2.world.callbacks.del(this.world_callbacks);
    this.world.clear();
  }

  protected entity_callbacks: IEntityCallbacks = {
    on_dead: () => {
      // 队伍存活计数
      const player_teams: { [x in string]?: number } = {};
      for (const [, f] of this.world.puppets)
        player_teams[f.team] = 0 // 玩家队伍

      for (const e of this.world.entities) {
        if (is_fighter(e) && e.hp > 0 && player_teams[e.team] !== void 0)
          ++player_teams[e.team]!; // 存活计数++
      }
      // 剩余队伍数
      let plater_team_remains = 0;
      traversal(player_teams, (_, v) => {
        if (v) ++plater_team_remains;
      })

      if (this.is_stage_mode) {
        // 大于0队，继续打
        if (plater_team_remains > 0) {
          this.fsm.use(0);
        } else {
          this.fsm.use(1);
        }
      } else if (this.is_vs_mode) {
        // 大于一队，继续打
        if (plater_team_remains > 1) {
          this.fsm.use(0);
        } else {
          this.fsm.use(1)
        }
      }

    }
  }
  protected world_callbacks: IWorldCallbacks = {
    on_fighter_add: (entity: Entity): void => {
      entity.callbacks.add(this.entity_callbacks)
    },
    on_stage_change: (stage, prev) => {
      if (!this.is_stage_mode) return;
      prev.callbacks.del(this.stage_callbacks)
      stage.callbacks.add(this.stage_callbacks);
      this.gogogo?.stop();
      this.gogogo?.node.set_visible(false)
      this.gogogo?.node.set_opacity(0)
      this.gogogo_loop?.stop();
      this.gogogo_loop?.node.set_visible(false)
      this.gogogo_loop?.node.set_opacity(0)
      if (this.jalousie) this.jalousie.open = true;
    }
  }
  override update(dt: number): void {
    if (
      !this.world.paused &&
      !this.lf2.world.stage.weapon_rain_disabled &&
      this.weapon_drop_timer.add() &&
      this.lf2.mt.range(0, 10) <= 2
    ) {
      this.lf2.weapons.add_random(1, true,
        this.is_stage_mode ?
          EntityGroup.StageWeapon :
          EntityGroup.VsWeapon
      )
    }
    const { cam_ctrl } = this.props;
    do {
      if (!cam_ctrl) break;
      const { staring, free } = cam_ctrl
      if (this._staring == staring && this._free == free)
        break;
      this._staring = staring
      this._free = free
      if (!free) {
        this.props.focus_prefix?.set_text("cam_controlling");
        this.props.focus_on?.node.set_visible(false)
      }
      const txt = staring ? `[${staring.team}] ${staring.name}` : '-'
      this.props.focus_prefix?.set_text("curr_focus")
      this.props.focus_on?.node.set_visible(true)
      this.props.focus_on?.set_text(txt)

    } while (0)
    if (this.is_stage_mode) {
      if (this.jalousie && !this.jalousie.open && this.jalousie.anim.done) {
        this.lf2.goto_next_stage()
        this.fsm.use(0)
        this.jalousie.open = true;
      }
    }
    this.fsm.update(dt)
  }

  override on_key_down(e: IUIKeyEvent): void {
    switch (e.game_key) {
      case GameKey.a:
      case GameKey.j: {
        if (
          this.fsm.state?.key == 2 &&
          this.fsm.state_time > 1000
        ) {
          e.stop_immediate_propagation();
          // this.lf2.pop_ui()
          this.on_stop()
          this.on_start()
        }
        break;
      }
    }
  }
}
