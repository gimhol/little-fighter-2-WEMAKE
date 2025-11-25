import type { World } from "../World";
import Callbacks from "../base/Callbacks";
import FSM from "../base/FSM";
import { new_team } from "../base/new_id";
import { Background } from "../bg/Background";
import { Defines, Difficulty, IBgData, IStageInfo, IStageObjectInfo, IStagePhaseInfo } from "../defines";
import { Ditto } from "../ditto";
import { Entity } from "../entity/Entity";
import { is_character, is_weapon } from "../entity/type_check";
import { floor, min } from "../utils";
import { find } from "../utils/container_help/find";
import { is_num } from "../utils/type_check";
import type IStageCallbacks from "./IStageCallbacks";
import Item from "./Item";
import { Status } from "./Status";

export class Stage implements Readonly<Omit<IStageInfo, 'bg'>> {
  static readonly TAG: string = "Stage";
  readonly world: World;
  readonly data: IStageInfo;
  readonly next_stage?: IStageInfo;
  readonly team: string;
  readonly callbacks = new Callbacks<IStageCallbacks>();
  private _disposers: (() => void)[] = [];
  private _phase_idx: number = 0;
  private _phase: IStagePhaseInfo | undefined;
  readonly items = new Set<Item>();
  private _is_stage_finish: boolean = false;
  private _is_chapter_finish: boolean = false;

  /** 节是否结束 */
  get is_stage_finish(): boolean { return this._is_stage_finish; }
  /** 章是否结束 */
  get is_chapter_finish(): boolean { return this._is_chapter_finish }

  get bg(): Background { return this.world.bg; }
  get phases() { return this.data.phases }
  get id(): string { return this.data.name; }
  get name(): string { return this.data.name; }

  get lf2() { return this.world.lf2; }
  get time() { return this.fsm.time; }

  get phase_idx(): number { return this._phase_idx };
  get phase(): IStagePhaseInfo | undefined { return this._phase; };

  /** 左边界 */
  left: number;
  /** 右边界 */
  right: number;
  near: number;
  far: number;
  width: number;
  depth: number;
  middle: { x: number; z: number; };
  /** 玩家左边界 */
  player_l: number;
  /** 玩家右边界 */
  player_r: number;
  /** 相机左边界 */
  cam_l: number;
  /** 相机右边界 */
  cam_r: number;
  /** 敌人左边界 */
  enemy_l: number;
  /** 敌人右边界 */
  enemy_r: number;
  /** 饮料左边界 */
  drink_l: number;
  /** 饮料右边界 */
  drink_r: number;

  change_bg(data: IBgData): Background {
    // FIXME: so messed up here...
    const prev_bg = this.world.bg;
    if (prev_bg) {
      if (prev_bg.data.id === data.id) return prev_bg;
    }
    prev_bg.dispose();
    const world_stage = this.world.stage;
    if (world_stage && this.world.bg.data.id === data.id)
      return this.world.bg

    const bg = new Background(this.world, data)
    this.left = this.cam_l = this.player_l = this.enemy_l = bg.left
    this.right = this.cam_r = this.player_r = this.enemy_r = bg.right
    this.near = bg.near;
    this.far = bg.far;
    this.width = bg.width;
    this.depth = bg.depth;
    this.middle = bg.middle;
    this.drink_l = -1200;
    this.drink_r = this.bg.width + 1200
    return this.world.bg = bg;
  }

  constructor(world: World, data: IStageInfo) {
    this.world = world;
    this.data = data;
    const bid = this.data.bg;
    const bdt = this.world.lf2.datas.backgrounds.find(v => v.id === bid);
    if (!bdt)
      Ditto.warn(Stage.TAG + "::constructor", `bg not found, id: ${bid}`);
    this.change_bg(bdt ?? Defines.VOID_BG);

    const bg = this.world.bg;
    this.left = this.cam_l = this.player_l = this.enemy_l = bg.left
    this.right = this.cam_r = this.player_r = this.enemy_r = bg.right
    this.near = bg.near;
    this.far = bg.far;
    this.width = bg.width;
    this.depth = bg.depth;
    this.middle = bg.middle;
    this.drink_l = -1200;
    this.drink_r = this.bg.width + 1200
    if (this.data.next)
      this.next_stage = this.lf2.stages.find(v => v.id === this.data.next);
    this.team = new_team();
  }

  readonly fsm = new FSM<Status>().add({
    key: Status.Running,
    update: () => {
      if (this._is_stage_finish) return Status.Completed;
    }
  }, {
    key: Status.Completed,
    enter: () => {
      this.callbacks.emit('on_stage_finish')(this)
      if (this.is_chapter_finish) this.callbacks.emit('on_chapter_finish')(this)
    },
    update: () => {
      if (this.should_goto_next_stage) {
        this.callbacks.emit('on_requrie_goto_next_stage')(this)
        return Status.End;
      }
    }
  }, {
    key: Status.End
  }).use(Status.Running)

  private _stop_bgm?: () => void;

  private play_phase_bgm() {
    const { phase } = this
    if (!phase) return;
    const { music } = phase;
    if (!music) return;
    this._stop_bgm = this.lf2.sounds.play_bgm(music);
  }

  stop_bgm(): void {
    this._stop_bgm?.();
  }

  private set_phase(phase: IStagePhaseInfo | undefined) {
    if (phase === this.phase) return;
    const prev = this.phase
    this.callbacks.emit("on_phase_changed")(this, this._phase = phase, prev);
    this.player_l = 0
    this.player_r = this.bg.right
    if (!phase) return;
    const { objects, respawn, health_up, mp_up } = phase;
    const hp_recovery = health_up?.[this.world.difficulty] || 0;
    const hp_respawn = respawn?.[this.world.difficulty] || 0;
    const mp_recovery = mp_up?.[this.world.difficulty] || 0;
    const loop_players_fighters = hp_recovery || hp_respawn || mp_recovery
    if (loop_players_fighters) {
      const teams = new Set<string>()
      for (const [, f] of this.world.slot_fighters)
        teams.add(f.team)
      for (const f of this.world.entities) {
        if (!is_character(f) && !teams.has(f.team)) continue;
        if (f.hp <= 0 && hp_respawn) {
          const hp = hp_respawn < 1 ?
            min(f.hp_max * hp_respawn, f.hp_max) :
            min(hp_respawn, f.hp_max)
          f.hp = f.hp_r = hp;
        } else if (f.hp > 0 && hp_recovery) {
          const hp = hp_recovery < 1 ?
            min(f.hp_r + (f.hp_max - f.hp_r) * hp_recovery, f.hp_max) :
            min(f.hp_r + hp_recovery, f.hp_max)
          f.hp = f.hp_r = hp
        }
        if (mp_recovery) f.mp = min(f.mp + mp_recovery, f.mp_max)
      }
    }

    this.play_phase_bgm();
    for (const object of objects) {
      this.spawn_object(object);
    }
    if (is_num(phase.cam_jump_to_x)) {
      this.world.renderer.cam_x = phase.cam_jump_to_x;
    }

    if (is_num(phase.player_jump_to_x)) {
      const x = phase.player_jump_to_x;

      const player_teams = new Set<string>();
      for (const [, v] of this.lf2.world.slot_fighters) {
        player_teams.add(v.team);
      }
      for (const entity of this.world.entities) {
        if (is_character(entity) && player_teams.has(entity.team))
          entity.position.x = this.lf2.random_in(x, x + 50);
      }
    }
    this.player_l = phase.player_l ?? 0
    this.cam_l = phase.camera_l ?? 0
    this.enemy_l = phase.enemy_l ?? -1200
    this.drink_l = phase.drink_l ?? -1200
    this.player_r = phase.player_r ?? phase.bound ?? this.bg.right
    this.cam_r = phase.camera_r ?? phase.bound ?? this.bg.right
    this.enemy_r = phase.enemy_r ?? ((phase.bound ?? this.bg.right) + 1200)
    this.drink_r = phase.drink_r ?? (this.bg.right + 1200)
  }

  enter_phase(idx: number) {
    this.set_phase(this.data.phases[this._phase_idx = idx])
    this._is_stage_finish = this.data.phases.length > 0 && this._phase_idx >= this.data.phases.length
    this._is_chapter_finish = this._is_stage_finish && this.next_stage?.chapter !== this.data.chapter
    return
  }

  async spawn_object(obj_info: IStageObjectInfo) {
    let count = 0;
    for (const [, c] of this.world.slot_fighters)
      count += c.data.base.ce ?? 1;
    if (!count) count = 1;

    switch (this.world.difficulty) {
      case Difficulty.Crazy:
        count *= 2
        break;
      case Difficulty.Easy:
      case Difficulty.Normal:
      case Difficulty.Difficult:
        break;
    }
    const { ratio, times = 1 } = obj_info;

    let spawn_count = ratio === void 0 ? 1 : floor(count * ratio);
    if (spawn_count <= 0 || !times) return;

    while (spawn_count > 0) {
      const stage_object = new Item(this, obj_info);
      stage_object.spawn();
      this.items.add(stage_object);
      --spawn_count;
    }
  }
  kill_all_enemies() {
    for (const o of this.items) {
      for (const e of o.fighters) {
        if (is_character(e) && e.team === this.team) e.hp = 0;
      }
    }
  }
  kill_soliders() {
    for (const o of this.items) {
      if (!o.info.is_soldier) continue;
      for (const e of o.fighters) {
        if (is_character(e) && e.team === this.team) e.hp = 0;
      }
    }
  }
  kill_boss() {
    for (const o of this.items) {
      if (!o.info.is_boss) continue;
      for (const e of o.fighters) {
        if (is_character(e) && e.team === this.team) e.hp = 0;
      }
    }
  }
  kill_others() {
    for (const o of this.items) {
      if (o.info.is_boss || o.info.is_soldier) continue;
      for (const e of o.fighters) {
        if (is_character(e) && e.team === this.team) e.hp = 0;
      }
    }
  }
  dispose() {
    for (const f of this._disposers) f();
    for (const item of this.items) item.dispose();

    const temp: Entity[] = [];
    const player_teams = new Set<string>();
    for (const [, v] of this.lf2.world.slot_fighters) {
      player_teams.add(v.team);
    }
    for (const e of this.world.entities) {
      if (is_character(e) && player_teams.has(e.team)) continue;
      else if (is_weapon(e) && e.holder && player_teams.has(e.holder.team))
        continue;
      temp.push(e);
    }
    this.world.del_entities(temp);
    this.callbacks.clear()
  }
  all_boss_dead(): boolean {
    return !find(this.items, i => i.info.is_boss);
  }
  all_enemies_dead(): boolean {
    return !find(this.items, i => i.fighters.size);
  }


  /** 是否应该进入下一关 */
  get should_goto_next_stage(): boolean {
    if (this.is_chapter_finish || !this.is_stage_finish)
      return false;
    return !find(this.world.entities, e => is_character(e) && e.hp > 0 && e.position.x < this.cam_r)
  }

  update() {
    this.fsm.update(1);
  }
}
