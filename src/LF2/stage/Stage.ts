import type { World } from "../World";
import Callbacks from "../base/Callbacks";
import FSM from "../base/FSM";
import { new_team } from "../base/new_id";
import { Background } from "../bg/Background";
import { Defines, Difficulty, IBgData, IStageInfo, IStageObjectInfo, IStagePhaseInfo } from "../defines";
import { IDialogInfo } from "../defines/IDialogInfo";
import { Ditto } from "../ditto";
import { Entity } from "../entity/Entity";
import { is_fighter, is_weapon } from "../entity/type_check";
import { floor, max, min, round_float } from "../utils";
import { find } from "../utils/container_help/find";
import { is_num } from "../utils/type_check";
import type IStageCallbacks from "./IStageCallbacks";
import { IDialogState } from "./IStageCallbacks";
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
  private _dialogs: IDialogState = {
    index: -1,
    list: []
  };
  phase_time: number = 0;
  dialog_time: number = 0;
  get title(): string { return this.data.title ?? this.bg.name }
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
  get dialog_idx(): number { return this._dialogs.index }
  get dialog(): IDialogInfo | undefined { return this._dialogs.list[this._dialogs.index] }
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
    this.drink_r = bg.width + 1200
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

  private play_phase_sounds() {
    const { phase } = this
    if (!phase) return;
    const { music, sounds } = phase;
    if (music !== void 0) {
      if (music) {
        this._stop_bgm = this.lf2.sounds.play_bgm(music);
      } else {
        this._stop_bgm = void 0;
        this.lf2.sounds.stop_bgm();
      }
    }
    if (sounds?.length) {
      for (const { path, x, y, z } of sounds) {
        this.lf2.sounds.play(path, x, y, z)
      }
    }
  }

  stop_bgm(): void {
    this._stop_bgm?.();
  }

  private set_phase(phase: IStagePhaseInfo | undefined) {
    if (phase === this.phase) return;
    this.phase_time = 0;
    const prev = this.phase
    this.callbacks.emit("on_phase_changed")(this, this._phase = phase, prev);
    this.player_l = 0
    this.player_r = this.bg.right
    if (!phase) return;

    const { objects, respawn, health_up, mp_up, dialogs } = phase;
    const hp_recovery = health_up?.[this.world.difficulty] || 0;
    const hp_respawn = respawn?.[this.world.difficulty] || 0;
    const mp_recovery = mp_up?.[this.world.difficulty] || 0;
    const loop_players_fighters = hp_recovery || hp_respawn || mp_recovery
    if (loop_players_fighters) {
      const teams = new Set<string>()
      for (const [, f] of this.world.puppets)
        teams.add(f.team)
      for (const f of this.world.entities) {
        if (!is_fighter(f) && !teams.has(f.team)) continue;
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
    this.play_phase_sounds();
    if (objects?.length) for (const object of objects) {
      this.spawn_object(object);
    }
    if (is_num(phase.cam_jump_to_x)) {
      this.world.renderer.cam_x = phase.cam_jump_to_x;
    }

    this.player_l = phase.player_l ?? 0
    this.cam_l = phase.camera_l ?? 0
    this.enemy_l = phase.enemy_l ?? -1200
    this.drink_l = phase.drink_l ?? -1200
    this.player_r = phase.player_r ?? phase.bound ?? this.bg.right
    this.cam_r = phase.camera_r ?? phase.bound ?? this.bg.right
    this.enemy_r = phase.enemy_r ?? ((phase.bound ?? this.bg.right) + 1200)
    this.drink_r = phase.drink_r ?? (this.bg.right + 1200)

    const player_x = is_num(phase.player_jump_to_x) ? phase.player_jump_to_x : void 0;
    const player_z = is_num(phase.player_jump_to_z) ? phase.player_jump_to_z : void 0;
    const player_f = is_num(phase.player_facing) ? phase.player_facing : void 0;
    if (player_x || player_z) {

      const teams = new Set<string>();
      for (const [, v] of this.lf2.world.puppets)
        teams.add(v.team);

      for (const entity of this.world.entities) {
        if (!is_fighter(entity) || !teams.has(entity.team)) continue;
        if (player_f === 1 || player_f === -1)
          entity.facing = player_f
        if (typeof player_x === 'number') {
          const l = max(this.player_l, player_x - 50)
          const r = min(this.player_r, player_x + 50)
          const x = this.lf2.mt.range(l, r)
          entity.set_position_x(x);
        }
        if (typeof player_z === 'number') {
          const f = max(this.far, player_z - 50)
          const n = min(this.near, player_z + 50)
          const z = this.lf2.mt.range(f, n)
          entity.set_position_z(z);
        }

      }
    }


    if (dialogs?.length) this.push_dialogs(dialogs)
  }
  push_dialogs(more: IDialogInfo[]) {
    const prev = this._dialogs;
    const list = [...prev.list, ...more]
    let index = prev.index;
    if (index < 0) {
      index = prev.index + 1;
      this.dialog_time = 0;
    }
    const curr = this._dialogs = { ...prev, list, index }
    this.callbacks.emit('on_dialogs_changed')(curr, prev, this)
  }
  next_dialog() {
    const prev = this._dialogs
    // prev.index == prev.list.length 代表结束，这是允许的。
    if (prev.index >= prev.list.length) return
    const curr = this._dialogs = {
      ...prev, index: prev.index + 1,
    }
    this.dialog_time = 0;
    this.callbacks.emit('on_dialogs_changed')(curr, prev, this)
  }
  clear_dialogs() {
    const prev = this._dialogs
    const curr = this._dialogs = { index: -1, list: [] }
    this.callbacks.emit('on_dialogs_changed')(curr, prev, this)
  }

  enter_phase(idx: number) {
    if (this.world.stage !== this) return;
    this.set_phase(this.data.phases[this._phase_idx = idx])
    this._is_stage_finish = this.data.phases.length > 0 && this._phase_idx >= this.data.phases.length
    this._is_chapter_finish = this._is_stage_finish && this.next_stage?.chapter !== this.data.chapter
    return
  }

  async spawn_object(obj_info: IStageObjectInfo) {
    if (this.world.stage !== this) return;
    let count = 0;
    for (const [, c] of this.world.puppets)
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

    let spawn_count = ratio === void 0 ? 1 : floor(round_float(count * ratio, 10));
    if (spawn_count <= 0 || !times) return;

    while (spawn_count > 0) {
      const stage_object = new Item(this, obj_info);
      stage_object.spawn();
      this.items.add(stage_object);
      --spawn_count;
    }
  }
  kill_all() {
    for (const o of this.items) {
      for (const e of o.fighters) {
        if (is_fighter(e) && e.team === this.team) e.hp = 0;
      }
    }
  }
  kill_soliders() {
    for (const o of this.items) {
      if (!o.info.is_soldier) continue;
      for (const e of o.fighters) {
        if (is_fighter(e) && e.team === this.team) e.hp = 0;
      }
    }
  }
  kill_boss() {
    for (const o of this.items) {
      if (!o.info.is_boss) continue;
      for (const e of o.fighters) {
        if (is_fighter(e) && e.team === this.team) e.hp = 0;
      }
    }
  }
  kill_others() {
    for (const o of this.items) {
      if (o.info.is_boss || o.info.is_soldier) continue;
      for (const e of o.fighters) {
        if (is_fighter(e) && e.team === this.team) e.hp = 0;
      }
    }
  }
  dispose() {
    for (const f of this._disposers) f();
    for (const item of this.items) item.dispose();

    const temp: Entity[] = [];
    const player_teams = new Set<string>();
    for (const [, v] of this.lf2.world.puppets) {
      player_teams.add(v.team);
    }
    for (const e of this.world.entities) {
      if (is_fighter(e) && player_teams.has(e.team)) continue;
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
  all_fighter_dead(): boolean {
    return !find(this.items, i => i.fighters.size)
  }
  /** 对话框已完毕 */
  dialog_cleared(): boolean {
    return this._dialogs.list.length <= 0 || this._dialogs.index >= this._dialogs.list.length;
  }
  is_phase_end(): boolean {
    const end_tester = this.phase?.end_tester
    if (end_tester) return end_tester.run(this);
    return this.all_fighter_dead() && this.dialog_cleared();
  }

  is_dialog_end(): boolean {
    const end_tester = this.dialog?.end_tester
    if (end_tester) return end_tester.run(this);
    return false;
  }
  check_phase_end(): boolean {
    const ret = this.is_phase_end()
    if (!ret) return ret
    this.enter_phase(this.phase_idx + 1);
    return ret
  }
  check_dialog_end(): boolean {
    const ret = this.is_dialog_end()
    if (!ret) return ret
    this.next_dialog();
    return ret
  }
  /** 是否应该进入下一关 */
  get should_goto_next_stage(): boolean {
    if (this.is_chapter_finish || !this.is_stage_finish)
      return false;
    return !find(this.world.entities, e => is_fighter(e) && e.hp > 0 && e.position.x < this.cam_r)
  }

  update() {
    if (this.phase) this.phase_time++
    if (this.dialog) this.dialog_time++
    this.fsm.update(1);

    this.check_phase_end();
    this.check_dialog_end();
  }
}
