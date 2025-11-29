import { Defines, EntityGroup, GameKey, GONE_FRAME_INFO, type IStagePhaseInfo } from "../../defines";
import type { Entity } from "../../entity";
import type IEntityCallbacks from "../../entity/IEntityCallbacks";
import { is_character } from "../../entity/type_check";
import { IWorldCallbacks } from "../../IWorldCallbacks";
import type { Stage } from "../../stage";
import type IStageCallbacks from "../../stage/IStageCallbacks";
import { traversal } from "../../utils/container_help/traversal";
import { IUIKeyEvent } from "../IUIKeyEvent";
import { UINode } from "../UINode";
import { Times } from "../utils/Times";
import { Jalousie } from "./Jalousie";
import { OpacityAnimation } from "./OpacityAnimation";
import { Sounds } from "./Sounds";
import { UIComponent } from "./UIComponent";

export class StageModeLogic extends UIComponent {
  static override readonly TAG = 'StageModeLogic'
  jalousie?: Jalousie;
  go_sounds!: Sounds;
  go_flashing!: OpacityAnimation;
  score_board!: UINode;
  protected state: 0 | 1 | 2 = 0;
  protected weapon_drop_timer = new Times(0, 300);
  protected gameover_timer = new Times(0, 180);
  protected entity_callbacks: IEntityCallbacks = {
    on_dead: () => {
      // 队伍存活计数
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

      // 大于0队，继续打
      if (team_remains > 0) {
        this.state = 0;
        this.gameover_timer.reset()
      } else {
        this.state = 1;
      }
    }

  }
  protected world_callbacks: IWorldCallbacks = {
    on_fighter_add: (entity: Entity): void => {
      entity.callbacks.add(this.entity_callbacks)
    },
    // on_fighter_del: (entity: Entity): void => {
    //   entity.callbacks.del(this.entity_callbacks)
    // },
    on_stage_change: (stage, prev) => {
      prev.callbacks.del(this.stage_callbacks)
      stage.callbacks.add(this.stage_callbacks);
      this.go_sounds.stop();
      this.go_flashing.stop();
      if (this.jalousie) this.jalousie.open = true;
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
      this.score_board.visible = false;
      if (prev) {
        if (!curr) {
          this.go_flashing.loop.set(0, Number.MAX_SAFE_INTEGER);
        } else {
          this.go_flashing.loop.set(0, 1);
        }
        this.go_sounds.start()
        this.go_flashing.start();
      } else {
        this.go_sounds.stop()
        this.go_flashing.stop();
      }
    },
    on_chapter_finish: (stage: Stage) => {
      this.debug('on_chapter_finish', stage)
      this.lf2.sounds.play_preset("pass");
      this.score_board.visible = true;
    },
    on_requrie_goto_next_stage: (stage: Stage) => {
      this.debug('on_requrie_goto_next_stage', stage)
      if (this.jalousie) this.jalousie.open = false;
    }
  }
  override on_start(): void {
    super.on_start?.();
    if (this.world.paused) this.world.paused = false;
    this.world.playrate = 1;
    this.score_board = this.node.find_child("score_board")!
    this.jalousie = this.node.search_component(Jalousie)
    this.go_sounds = this.node.search_component(Sounds, "go_sounds")!
    this.go_flashing = this.node.search_component(OpacityAnimation, "go_flashing")!
    for (const [, f] of this.world.slot_fighters) {
      this.world_callbacks.on_fighter_add?.(f)
    }
  }
  override on_stop(): void {
    this.lf2.change_bg(Defines.VOID_BG)
    this.lf2.change_stage(Defines.VOID_STAGE)
    this.world.entities.forEach(v => v.enter_frame(GONE_FRAME_INFO))
  }
  override on_resume(): void {
    this.lf2.world.stage.callbacks.add(this.stage_callbacks);
    this.lf2.world.callbacks.add(this.world_callbacks);
  }
  override on_pause(): void {
    this.lf2.world.stage.callbacks.del(this.stage_callbacks)
    this.lf2.world.callbacks.del(this.world_callbacks);
  }
  override update(dt: number): void {
    if (!this.world.paused && this.weapon_drop_timer.add() && this.lf2.random_in(0, 10) < 5) {
      this.lf2.weapons.add_random(1, true, EntityGroup.StageWeapon)
    }
    if (this.jalousie && !this.jalousie.open && this.jalousie.anim.done) {
      this.lf2.goto_next_stage()
      this.jalousie.open = true;
    }
    if (this.state === 1 && this.gameover_timer.add()) {
      this.state = 2
      this.lf2.sounds.play_preset("end");
      this.score_board.visible = true;
    }
  }
  override on_key_down(e: IUIKeyEvent): void {
    switch (e.game_key) {
      case GameKey.a:
      case GameKey.j: {
        if (this.world.stage.is_chapter_finish) { 
          e.stop_immediate_propagation();
          this.lf2.goto_next_stage();
        } else if (this.state == 2) {
          this.lf2.pop_ui_safe()
        }
        break;
      }
    }
  }
}
