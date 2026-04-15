import FSM from "@/LF2/base/FSM";
import { Entity } from "@/LF2/entity";
import { Times } from "@/LF2/utils/Times";
import { new_team } from "../../base";
import { Defines, EntityGroup, GameKey } from "../../defines";
import IEntityCallbacks from "../../entity/IEntityCallbacks";
import { is_fighter } from "../../entity/type_check";
import { floor, traversal } from "../../utils";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { UITextLoader } from "../UITextLoader";
import { CameraCtrl } from "./CameraCtrl";
import { ComponentFSMState } from "./ComponentFSMState";
import { FighterStatBar } from "./FighterStatBar";
import { UIComponent } from "./UIComponent";
import { StatBarType } from "@/LF2/entity/StatBarType";
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
    const score_board = this.node.find_child("score_board")
    score_board?.set_visible(true);
  }
  override leave(): void {
    const score_board = this.node.find_child("score_board")
    score_board?.set_visible(false);
  }
}

export class DemoModeLogic extends UIComponent implements IEntityCallbacks {
  static override readonly TAG = 'DemoModeLogic'
  readonly fsm = new FSM<number, FSMState>().add(
    new FSMState(this),
    new FSMState_BeforeEnd(this),
    new FSMState_End(this)
  )
  protected weapon_drop_timer = new Times(0, 1200);
  override on_start(): void {
    super.on_start?.();
    this.fsm.use(0)

    this.node.search_child("curr_focus")!.visible = false

    const bg_data = this.lf2.mt.pick(this.lf2.datas.backgrounds);
    if (bg_data) this.lf2.change_bg(bg_data);

    const character_datas = this.lf2.datas.get_characters_of_group(
      EntityGroup.Regular,
    );
    const player_count = floor(this.lf2.mt.range(2, 8));
    const player_teams: string[] = [];

    for (let i = 0; i < player_count; i++) {
      player_teams.push(new_team());
    }
    this.world.paused = false;
    switch (player_count) {
      case 4: {
        if (this.lf2.mt.take([0, 1])) {
          player_teams.fill(Defines.TeamEnum.Team_1, 0, 2);
          player_teams.fill(Defines.TeamEnum.Team_2, 2, 4);
        }
        break;
      }
      case 6: {
        switch (this.lf2.mt.take([0, 1, 2])) {
          case 1: {
            player_teams.fill(Defines.TeamEnum.Team_1, 0, 3);
            player_teams.fill(Defines.TeamEnum.Team_2, 3, 6);
            break;
          }
          case 2: {
            player_teams.fill(Defines.TeamEnum.Team_1, 0, 2);
            player_teams.fill(Defines.TeamEnum.Team_2, 2, 4);
            player_teams.fill(Defines.TeamEnum.Team_3, 4, 6);
            break;
          }
        }
        break;
      }
      case 8: {
        switch (this.lf2.mt.take([0, 1, 2])) {
          case 1: {
            player_teams.fill(Defines.TeamEnum.Team_1, 0, 4);
            player_teams.fill(Defines.TeamEnum.Team_2, 4, 8);
            break;
          }
          case 2: {
            player_teams.fill(Defines.TeamEnum.Team_1, 0, 2);
            player_teams.fill(Defines.TeamEnum.Team_2, 2, 4);
            player_teams.fill(Defines.TeamEnum.Team_3, 4, 6);
            player_teams.fill(Defines.TeamEnum.Team_4, 6, 8);
            break;
          }
        }
        break;
      }
    }
    const player_infos = Array.from(this.lf2.players.values());
    for (let i = 0; i < player_count; i++) {
      const player = player_infos[i]!;
      if (!player) continue;

      const character_data = this.lf2.mt.take(character_datas);
      if (!character_data) continue;

      const fighter = this.lf2.factory.create_entity(this.world, character_data);
      if (!fighter) return;

      fighter.team = player_teams.shift() ?? new_team();
      fighter.facing = this.lf2.mt.pick([1, -1] as const)!;
      fighter.callbacks.add(this);
      fighter.key_role = true;
      fighter.name_visible = true;
      fighter.stat_bar_type = StatBarType.UI;
      const { far, near, left, right } = this.lf2.world.bg;

      fighter.ctrl = this.lf2.factory.create_ctrl(
        character_data.id,
        player.id,
        fighter,
      );
      fighter.set_position(
        this.lf2.mt.range(left, right),
        void 0,
        this.lf2.mt.range(far, near)
      )
      fighter.blinking = this.world.begin_blink_time;
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
  }
  override on_stop(): void {
    super.on_stop?.();
    this.world.clear();
  }

  on_dead() {
    // 各队伍存活计数
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

    // 大于一队，继续打
    if (team_remains > 1) return;
    this.fsm.use(1)
  }

  protected _cam_ctrl?: CameraCtrl;
  protected _staring?: Entity | undefined;
  protected _free?: boolean
  get cam_ctrl(): CameraCtrl | undefined {
    if (!this._cam_ctrl)
      this._cam_ctrl = this.node.find_component(CameraCtrl)
    return this._cam_ctrl
  }
  protected txt_loader = new UITextLoader(() => this.node.search_child("curr_focus"))

  override update(dt: number): void {
    this.fsm.update(dt)
    if (!this.world.paused && this.weapon_drop_timer.add() && this.lf2.mt.range(0, 10) <= 2) {
      this.lf2.weapons.add_random(1, true, EntityGroup.VsWeapon)
    }
    const staring = this.cam_ctrl?.staring
    // TODO
    if (this._staring !== staring || this._free != !!this.cam_ctrl?.free) {
      if (staring) {
        const txt = `[${staring.team}] ${staring.data.base.name} (${staring.name})`
        this.txt_loader.set_text([txt])
        this.node.search_child("curr_focus_prefix")!.txt_idx.value = 0
        this.node.search_child("curr_focus")!.visible = true
      } else {
        this.node.search_child("curr_focus_prefix")!.txt_idx.value = 1
        this.node.search_child("curr_focus")!.visible = false
      }
      this._staring = staring
    }
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
