import { arithmetic_progression, CheatType, FacingFlag, IStageInfo, Label, Randoming, StageGroup, UINode } from "@/LF2";
import FSM from "@/LF2/base/FSM";
import { Entity } from "@/LF2/entity";
import { StatBarType } from "@/LF2/entity/StatBarType";
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
export interface IDemoModeLogicProps {
  focus_prefix?: Label;
  focus_on?: Label;
  cam_ctrl?: CameraCtrl;
  score_board?: UINode;
}
interface DemoSituation {
  player_count: number;
  stage_mode: boolean;
  player_teams: string[]
}
export class DemoModeLogic extends UIComponent<IDemoModeLogicProps> implements IEntityCallbacks {
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
    new FSMState_End(this)
  )
  protected _staring?: Entity | undefined;
  protected _free?: boolean
  protected weapon_drop_timer = new Times(0, 1200);
  protected _situations: Randoming<DemoSituation> | null = null
  protected _situation: DemoSituation | null = null

  get situations() {
    if (this._situations) return this._situations;
    return this._situations = new Randoming<DemoSituation>([
      /* 闯关 */
      { player_count: 1, stage_mode: true, player_teams: new Array(1).fill('1') },
      { player_count: 2, stage_mode: true, player_teams: new Array(2).fill('1') },
      { player_count: 3, stage_mode: true, player_teams: new Array(3).fill('1') },
      { player_count: 4, stage_mode: true, player_teams: new Array(4).fill('1') },
      { player_count: 5, stage_mode: true, player_teams: new Array(5).fill('1') },
      { player_count: 6, stage_mode: true, player_teams: new Array(6).fill('1') },
      { player_count: 7, stage_mode: true, player_teams: new Array(7).fill('1') },
      { player_count: 8, stage_mode: true, player_teams: new Array(8).fill('1') },

      /* 各自为战 */
      { player_count: 2, stage_mode: false, player_teams: arithmetic_progression(1, 2).map(v => '' + v) },
      { player_count: 3, stage_mode: false, player_teams: arithmetic_progression(1, 3).map(v => '' + v) },
      { player_count: 4, stage_mode: false, player_teams: arithmetic_progression(1, 4).map(v => '' + v) },
      { player_count: 5, stage_mode: false, player_teams: arithmetic_progression(1, 5).map(v => '' + v) },
      { player_count: 6, stage_mode: false, player_teams: arithmetic_progression(1, 6).map(v => '' + v) },
      { player_count: 7, stage_mode: false, player_teams: arithmetic_progression(1, 7).map(v => '' + v) },
      { player_count: 8, stage_mode: false, player_teams: arithmetic_progression(1, 8).map(v => '' + v) },

      /* 两队交战 */
      { player_count: 4, stage_mode: false, player_teams: ['1', '1', '2', '2'] },
      { player_count: 6, stage_mode: false, player_teams: ['1', '1', '1', '2', '2', '2'] },
      { player_count: 7, stage_mode: false, player_teams: ['1', '1', '1', '1', '2', '2', '2', '2'] },

      /* 三队交战 */
      { player_count: 6, stage_mode: false, player_teams: ['1', '1', '2', '2', '3', '3'] },

      /* 四队交战 */
      { player_count: 7, stage_mode: false, player_teams: ['1', '1', '2', '2', '3', '3', '4', '4'] },
    ], this.lf2)
  }
  get stages(): IStageInfo[] {
    const cheat_0 = this.lf2.is_cheat(CheatType.LF2_NET);
    const cheat_1 = this.lf2.is_cheat(CheatType.GIM_INK);
    const all = this.lf2.datas.stages;
    if (cheat_0 && cheat_1) return all
    const ret = all.filter(v => {
      if (v.group?.some(v => v == StageGroup.Hidden))
        return false;
      if (v.group?.some(v => v == StageGroup.Dev))
        return false;
      if (!cheat_1 && !v.is_starting)
        return false
      return true
    })
    return ret.length ? ret : all;
  }
  get situation() {
    if (this._situation) return this._situation;
    return this._situation = this.situations.take();
  }
  get is_stage_mode(): boolean { return this.situation.stage_mode }
  get is_vs_mode(): boolean { return !this.situation.stage_mode }
  override on_start(): void {
    super.on_start?.();
    this.fsm.use(0)


    this.node.search_node("curr_focus")!.visible = false
    const bg = this.lf2.mt.pick(this.lf2.datas.backgrounds);
    if (bg) this.lf2.change_bg(bg.id);
    const character_datas = this.lf2.datas.get_characters_of_group(
      EntityGroup.Regular,
    );
    this.world.paused = false;
    const { far, near, left, right } = this.lf2.world.bg;
    const { is_stage_mode, is_vs_mode } = this;
    let cam_x = is_stage_mode ? 0 : this.lf2.mt.range(left, right - Defines.MODERN_SCREEN_WIDTH)

    const { situation } = this;
    const { player_count, player_teams } = situation
    const player_infos = Array.from(this.lf2.players.values());
    for (let i = 0; i < player_count; i++) {
      const player = player_infos[i]!;
      if (!player) continue;

      const fighter_data = this.lf2.mt.take(character_datas);
      if (!fighter_data) continue;

      const fighter = this.lf2.factory.create_entity(this.world, fighter_data);
      if (!fighter) return;
      fighter.team = player_teams.shift() ?? new_team();
      fighter.facing = is_stage_mode ?
        FacingFlag.Right :
        this.lf2.mt.pick([FacingFlag.Left, FacingFlag.Right])!;

      fighter.ctrl = this.lf2.factory.create_ctrl(fighter_data.id, player.id, fighter);

      fighter.callbacks.add(this);
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

    if (this.is_stage_mode) {
      this.lf2.change_stage(this.lf2.mt.take(this.stages)?.id!);
    }
  }
  override on_stop(): void {
    super.on_stop?.();
    this.world.clear();
  }

  on_dead() {
    // 队伍存活计数
    const player_teams: { [x in string]?: number } = {};
    for (const [, f] of this.world.puppets)
      player_teams[f.team] = 0 // 玩家队伍

    for (const e of this.world.entities) {
      if (is_fighter(e) && e.hp > 0 && player_teams[e.team] !== void 0)
        ++player_teams[e.team]!; // 存活计数++
    }
    // 剩余队伍数
    let team_remains = 0;
    traversal(player_teams, (_, v) => {
      if (v) ++team_remains;
    })

    if (this.is_stage_mode) {

      // 大于0队，继续打
      if (team_remains > 0) {
        this.fsm.use(0);
      } else {
        this.fsm.use(1);
      }
    } else if (this.is_vs_mode) {

      // 大于一队，继续打
      if (team_remains > 1) return;
      this.fsm.use(1)
    }

  }

  override update(dt: number): void {
    this.fsm.update(dt)
    if (!this.world.paused && this.weapon_drop_timer.add() && this.lf2.mt.range(0, 10) <= 2) {
      this.lf2.weapons.add_random(1, true, EntityGroup.VsWeapon)
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
          this.lf2.pop_ui()
        }
        break;
      }
    }
  }
}
