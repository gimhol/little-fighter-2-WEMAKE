import { Defines, EntityGroup, GameKey, GONE_FRAME_INFO } from "../../defines";
import type IEntityCallbacks from "../../entity/IEntityCallbacks";
import { is_character } from "../../entity/type_check";
import { traversal } from "../../utils/container_help/traversal";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { UINode } from "../UINode";
import { Times } from "../../utils/Times";
import { FighterStatBar } from "./FighterStatBar";
import { UIComponent } from "./UIComponent";

export class VsModeLogic extends UIComponent {
  static override readonly TAG = 'VsModeLogic'
  protected score_board?: UINode;
  protected state: 0 | 1 | 2 = 0;
  protected cancellers: (() => void)[] = [];
  protected weapon_drop_timer = new Times(0, 300);
  protected gameover_timer = new Times(0, 180);
  protected fighter_callbacks: IEntityCallbacks = {
    on_dead: () => {
      // 各队伍存活计数
      const player_teams: { [x in string]?: number } = {};

      for (const [, f] of this.world.slot_fighters)
        player_teams[f.team] = 0 // 玩家队伍

      for (const e of this.world.entities) {
        if (is_character(e) && e.hp > 0 && player_teams[e.team] !== void 0)
          ++player_teams[e.team]!; // 存活计数++
      }

      // 剩余队伍数
      let team_remains = 0;
      traversal(player_teams, (_, v) => {
        if (v) ++team_remains;
      })

      // 大于一队，继续打
      if (team_remains > 1) return;
      this.state = 1;
    }
  }
  protected reset() {
    this.gameover_timer.reset()
    this.state = 0;
    this.world.paused = false;
    this.world.playrate = 1;
    this.world.infinity_mp = false;
  }
  override on_start(): void {
    super.on_start?.();
    this.score_board = this.node.find_child("score_board")!
    for (const [, f] of this.world.slot_fighters)
      this.cancellers.push(f.callbacks.add(this.fighter_callbacks))
    this.reset();

    const stat_bars = this.node.search_components(FighterStatBar)

    let player_count = 0;
    for (const [, f] of this.lf2.slot_fighters) {
      if (f) ++player_count
      
    }
    for (let i = 0; i < stat_bars.length; i++) {
      const stat_bar = stat_bars[i];
      let enabled = false;
      if (player_count == 2) { // 1 on 1.
        enabled = !!stat_bar.node.id?.startsWith(`_1v1_fighter_stat_`);
      } else {
        enabled = player_count >= Number(stat_bar.node.id?.match(/p(\d)_stat/)?.[1]);
      }
      stat_bar.node.visible = enabled;
      stat_bar.node.disabled = !enabled;
      if (enabled) continue;
      stat_bars.splice(i, 1);
      --i;
    }

    for (const [, fighter] of this.lf2.slot_fighters) {
      if (!fighter) continue;
      const stat_bar = stat_bars.shift()
      if (!stat_bar) break;
      stat_bar.set_entity(fighter)
    }
  }
  override on_stop(): void {
    this.lf2.change_bg(Defines.VOID_BG)
    this.lf2.change_stage(Defines.VOID_STAGE)
    this.world.entities.forEach(v => {
      v.enter_frame(GONE_FRAME_INFO)
      v.next_frame = GONE_FRAME_INFO
    })
    for (const func of this.cancellers) func()
    this.cancellers.length = 0;
  }
  override update(): void {
    if (!this.world.paused && this.weapon_drop_timer.add() && this.lf2.random_in(0, 10) < 5) {
      this.lf2.weapons.add_random(1, true, EntityGroup.VsWeapon)
    }
    if (this.state === 1 && this.gameover_timer.add()) {
      this.state = 2
      this.lf2.sounds.play_preset("end");
      if (this.score_board) this.score_board.visible = true;
    }
  }
  override on_key_down(e: IUIKeyEvent): void {
    switch (e.game_key) {
      case GameKey.a:
      case GameKey.j: {
        if (this.state == 2) {
          e.stop_immediate_propagation();
          this.lf2.pop_ui()
        }
        break;
      }
    }
  }
}
