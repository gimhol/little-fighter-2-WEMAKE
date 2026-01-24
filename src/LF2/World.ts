import { Callbacks, FPS, ICollision } from "./base";
import { Background } from "./bg/Background";
import { collisions_keeper } from "./collision/CollisionKeeper";
import {
  ALL_ENTITY_ENUM,
  Builtin_FrameId,
  CheatType,
  Defines,
  EntityGroup,
  HitFlag,
  IBdyInfo, IBounding, IEntityData,
  IFrameInfo, IItrInfo, ItrKind,
  IVector3,
  O_ID,
  StateEnum,
  WeaponType
} from "./defines";
import { CMD } from "./defines/CMD";
import { Ditto } from "./ditto";
import { IWorldRenderer } from "./ditto/render/IWorldRenderer";
import {
  Entity, Factory,
  is_ball,
  is_bot_ctrl,
  is_fighter,
  is_human_ctrl,
  is_weapon
} from "./entity";
import { Ground } from "./Ground";
import { manhattan_xz } from "./helper/manhattan_xz";
import { IWorldCallbacks } from "./IWorldCallbacks";
import { LF2 } from "./LF2";
import { Stage } from "./stage/Stage";
import { Transform } from "./Transform";
import { Times } from "./ui";
import { abs, is_num, min, round } from "./utils";
import { WorldDataset } from "./WorldDataset";
export class World extends WorldDataset {
  static override readonly TAG: string = "World";
  readonly lf2: LF2;
  readonly callbacks = new Callbacks<IWorldCallbacks>();
  private _spark_data?: IEntityData;
  private _etc_data?: IEntityData;
  private _bg: Background;
  private _stage: Stage;
  private _need_FPS: boolean = true;
  private _need_UPS: boolean = true;
  private _FPS = new FPS(0.9);
  private _UPS = new FPS(0.9);
  private _prev_time: number = 0;
  private _fix_radio: number = 1;
  private _update_count: number = 0;
  private _render_worker_id?: ReturnType<typeof Ditto.Render.add>;
  private _update_worker_id?: ReturnType<typeof Ditto.Interval.add>;
  private _game_time = new Times();

  get game_time() { return this._game_time }

  readonly transform: Transform = new Transform()
  readonly entity_map = new Map<string, Entity>();
  readonly entities = new Set<Entity>();
  readonly incorporeities = new Set<Entity>();
  /** 
   * 被玩家操作的角色 
   * 键: 玩家ID
   * 值: 角色
   */
  readonly puppets = new Map<string, Entity>();
  readonly v_collisions: ICollision[] = [];
  readonly a_collisions = new Map<Entity, ICollision>();
  get bg() { return this._bg; }
  set bg(v: Background) {
    if (v === this._bg) return;
    const o = this._bg;
    this._bg = v;
    o.dispose();
  }
  get stage() {
    return this._stage;
  }
  set stage(v) {
    if (v === this._stage) return;
    const o = this._stage;
    this._stage = v;
    this.callbacks.emit("on_stage_change")(v, o);
    o.dispose();
    v.enter_phase(0);
  }
  override on_dataset_change = (k: string, curr: any, prev: any) => {
    this.callbacks.emit('on_dataset_change')(k as any, curr, prev, this)
    if (k === 'sync_render') {
      this.start_render();
      this.start_update();
    }
  };
  get left() {
    return this.bg.left || 0;
  }
  get right() {
    return this.bg.right || 0;
  }
  get near() {
    return this.bg.near || 0;
  }
  get far() {
    return this.bg.far || 0;
  }
  get width() {
    return this.bg.width || 0;
  }
  get depth() {
    return this.bg.depth || 0;
  }
  get middle() {
    return this.bg.middle || { x: 0, z: 0 };
  }

  cam_speed = 0;
  lock_cam_x: number | undefined = void 0;
  public renderer: IWorldRenderer;

  team_come(_team: string, x: number, y: number, z: number) {
    for (const e of this.entities) {
      const { ctrl, team } = e;
      if (_team === team && is_bot_ctrl(ctrl)) {
        ctrl.goto(x, y, z)
      }
    }
  }
  team_move(_team: string) {
    for (const e of this.entities) {
      const { ctrl, team } = e;
      if (_team === team && is_bot_ctrl(ctrl)) {
        ctrl.move()
      }
    }
  }
  team_stay(_team: string) {
    for (const e of this.entities) {
      const { ctrl, team } = e;
      if (_team === team && is_bot_ctrl(ctrl)) {
        ctrl.stay()
      }
    }
  }
  constructor(lf2: LF2) {
    super()
    this.lf2 = lf2;
    this._bg = new Background(this, Defines.VOID_BG);
    this._stage = new Stage(this, Defines.VOID_STAGE);
    this.renderer = new Ditto.WorldRender(this);
  }
  add_incorporeities(...entities: Entity[]) {
    for (const entity of entities) {
      this.incorporeities.add(entity);
      this.renderer.add_entity(entity);
    }
  }
  add_entities(...entities: Entity[]) {
    for (const entity of entities) {
      if (is_fighter(entity)) {
        this.callbacks.emit("on_fighter_add")(entity);
        const player = this.lf2.players.get(entity.ctrl.player_id)
        if (player) {
          player.fighter = entity
          this.puppets.set(entity.ctrl.player_id, entity);
          this.callbacks.emit("on_player_character_add")(entity.ctrl.player_id);
        }
      }
      this.entities.add(entity);
      this.entity_map.set(entity.id, entity)
      this.renderer.add_entity(entity);
    }
  }

  list_enemy_fighters(e: Entity, fn: (other: Entity) => boolean): Entity[] {
    const ret: Entity[] = []
    for (const o of this.entities) {
      if (!e.is_ally(o) && is_fighter(o) && fn(o)) {
        ret.push(o)
      }
    }
    const { x, z } = e.position;
    ret.sort(({ position: a }, { position: b }) => abs(a.x - x) + abs(a.z - z) / 2 - abs(b.x - x) - abs(b.z - z) / 2)
    return ret;
  }

  list_ally_fighters(e: Entity, fn: (other: Entity) => boolean): Entity[] {
    const ret: Entity[] = []
    for (const o of this.entities) {
      if (e.is_ally(o) && is_fighter(o) && fn(o)) {
        ret.push(o)
      }
    }
    const { x, z } = e.position;
    ret.sort(({ position: a }, { position: b }) => abs(a.x - x) + abs(a.z - z) / 2 - abs(b.x - x) - abs(b.z - z) / 2)
    return ret;
  }

  del_entity(entity: Entity) {
    if (!(this.entities.delete(entity) || this.incorporeities.delete(entity)))
      return false;
    this.entity_map.delete(entity.id)
    if (is_fighter(entity))
      this.callbacks.emit("on_fighter_del")(entity);
    const player = this.lf2.players.get(entity.ctrl.player_id)
    if (player) player.fighter = void 0
    const ok = this.puppets.delete(entity.ctrl.player_id);
    if (ok) this.callbacks.emit("on_player_character_del")(entity.ctrl.player_id);
    this.renderer.del_entity(entity);
    entity.dispose();
    Factory.inst.release(entity)
    return true;
  }

  del_entities(entities: Entity[]) {
    for (const e of entities) {
      this.del_entity(e);
    }
  }

  stop_render() {
    this._render_worker_id && Ditto.Render.del(this._render_worker_id);
    this._render_worker_id = 0;
  }

  start_render() {
    if (this._render_worker_id) Ditto.Render.del(this._render_worker_id);
    if (this.sync_render) return;
    let _r_prev_time = 0;
    const on_render = (time: number) => {
      const dt = time - _r_prev_time;
      if (_r_prev_time !== 0) {
        this.render_once(dt);
      }
      if (_r_prev_time !== 0 && this._need_FPS) {
        this._FPS.update(dt);
        this.callbacks.emit("on_fps_update")(this._FPS.value);
      }
      _r_prev_time = time;
    };
    this._render_worker_id && Ditto.Render.del(this._render_worker_id);
    this._render_worker_id = Ditto.Render.add(on_render);
  }

  stop_update() {
    this._update_worker_id && Ditto.Interval.del(this._update_worker_id);
    this._update_worker_id = void 0;
  }
  before_update?(): void;
  after_update?(): void;
  private _sleeping: boolean = false;
  sleep(): void { this._sleeping = true }
  awake(): void { this._sleeping = false }
  start_update() {
    if (this._update_worker_id) Ditto.Interval.del(this._update_worker_id);
    this._prev_time = Date.now();
    this._fix_radio = 1;
    this._update_count = 0;
    const on_update = () => {
      const time = Date.now();
      const real_dt = time - this._prev_time;
      if (real_dt < this._ideally_dt * this._fix_radio) return;
      if (this._sleeping) return;
      this.before_update?.();
      this._update_count++;
      this.update_once();
      this.lf2.events.length = 0;
      this.lf2.cmds.length = 0;
      this.lf2.broadcasts.length = 0;
      if (0 === this._update_count % this.sync_render) {
        this.render_once(real_dt);
        if (this._need_FPS) this.callbacks.emit("on_fps_update")(this._UPS.value / this.sync_render);
      }
      if (this._need_UPS) this.callbacks.emit("on_ups_update")(this._UPS.value, 0);
      this.after_update?.();
      this._UPS.update(real_dt);
      this._fix_radio = this._UPS.value / 70;
      this._prev_time = time;

    };
    this._update_worker_id = Ditto.Interval.add(on_update, 0);
  }

  /**
   * 限制角色位置
   * 
   * @param {Entity} e 角色实体
   * @return {void} 
   * @memberof World
   */
  restrict_fighter(e: Entity): void {
    const { near, far, player_l, player_r, enemy_l, enemy_r, team } = this.stage;

    const is_player = e.team !== team;
    const l = is_player ? player_l : enemy_l;
    const r = is_player ? player_r : enemy_r;

    const { x, z } = e.position;
    if (x < l) e.set_position_x(l);
    else if (x > r) e.set_position_x(r);

    if (z < far) e.set_position_z(far);
    else if (z > near) e.set_position_z(near);
  }

  /**
   * 限制“波”位置
   *
   * 当“波”离开地图太远，直接标记为移除
   * 
   * @param {Entity} e “波”
   * @return {void}
   * @memberof World
   */
  restrict_ball(e: Entity): void {
    const { left, right, near, far } = this.stage;
    const { x, z } = e.position;
    if (x < left - 800) e.enter_frame(Defines.NEXT_FRAME_GONE);
    else if (x > right + 800) e.enter_frame(Defines.NEXT_FRAME_GONE);
    if (z < far) e.set_position_z(far);
    else if (z > near) e.set_position_z(near);
  }

  /**
   * 限制“武器”位置
   *
   * 当“武器”离开地图太远，直接标记为移除
   * 
   * @param {Entity} e “武器”
   * @return {void}
   * @memberof World
   */
  restrict_weapon(e: Entity): void {
    const { left, right, near, far, drink_l, drink_r } = this.stage;
    let { x, z } = e.position;

    if (e.data.base.type === WeaponType.Drink) {
      const l = drink_l;
      const r = drink_r;
      if (x < l) e.set_position_x(x = l);
      else if (x > r) e.set_position_x(x = r);
    }

    if (x < left - 100) e.enter_frame(Defines.NEXT_FRAME_GONE);
    else if (x > right + 100) e.enter_frame(Defines.NEXT_FRAME_GONE);
    if (z < far) e.set_position_z(far);
    else if (z > near) e.set_position_z(near);
  }

  /**
   * 限制“实体”位置
   *
   * @param {Entity} e
   * @memberof World
   */
  restrict(e: Entity): void {
    if (is_fighter(e)) {
      this.restrict_fighter(e);
    } else if (is_ball(e)) {
      this.restrict_ball(e);
    } else if (is_weapon(e)) {
      this.restrict_weapon(e);
    }
  }

  private gone_entities: Entity[] = [];
  private _enemy_chasers = new Set<Entity>();
  private _ally_chasers = new Set<Entity>();
  add_enemy_chaser(entity: Entity) {
    this._enemy_chasers.add(entity);
  }
  del_enemy_chaser(entity: Entity) {
    this._enemy_chasers.delete(entity);
    entity.chasing = null;
  }
  add_ally_chaser(entity: Entity) {
    this._ally_chasers.add(entity);
  }
  del_ally_chaser(entity: Entity) {
    this._ally_chasers.delete(entity);
    entity.chasing = null;
  }

  protected update_ui() {
    const { ui_stacks } = this.lf2
    const len = ui_stacks.length
    let flag = true
    for (let i = len - 1; i >= 0; i--) {
      const ui_stack = ui_stacks[i];
      const { ui } = ui_stack
      if (!ui || ui.disabled) continue;
      ui.update(16);

      if (!flag) continue;
      for (const e of this.lf2.events)
        if (e.pressed) ui.on_key_down(e)
        else ui.on_key_up(e)
      flag = false
    }
  }

  protected handle_keys() {
    if (!this.lf2.events.length) return;
    if (this.stage.control_disabled) return;
    for (const e of this.lf2.events) {
      const fighter = this.puppets.get(e.player)
      if (!fighter) continue;
      const { ctrl } = fighter
      if (!is_human_ctrl(ctrl)) continue;
      if (e.pressed) ctrl.start(e.game_key)
      else ctrl.end(e.game_key)
    }
  }

  protected handle_cmds() {
    if (!this.lf2.cmds.length) return;
    for (const key of this.lf2.cmds) {
      switch (key) {
        case CMD.LF2_NET:
        case CMD.HERO_FT:
        case CMD.GIM_INK:
          this.lf2.toggle_cheat_enabled(key);
          continue;
        case CMD.F1: this.paused = !this.paused; continue;
        case CMD.F2: this.set_paused(2); continue;
        case CMD.F4: this.lf2.pop_ui_safe(); continue;
        case CMD.F5:
          this.playrate = this.playrate === 1 ? 100 : 1;
          continue;
      }
      if (this.stage.id === Defines.VOID_STAGE.id || this.lf2.is_cheat(CheatType.HERO_FT)) {
        switch (key) {
          case CMD.F6:
            this.infinity_mp = !this.infinity_mp;
            continue;
          case CMD.F7:
            for (const e of this.entities) {
              if (!is_fighter(e)) continue;
              e.hp = e.hp_r = e.hp_max;
              e.mp = e.mp_max;
            }
            continue;
          case CMD.F8:
            this.lf2.weapons.add_random(1, true, EntityGroup.VsWeapon)
            continue;
          case CMD.F9:
            this.stage.kill_all()
            continue;
          case CMD.F10:
            for (const e of this.entities) if (is_weapon(e)) e.hp = 0;
            continue;
          case CMD.KILL_ENEMIES:
            this.stage.kill_all()
            continue;
          case CMD.KILL_BOSS:
            this.stage.kill_boss()
            continue;
          case CMD.KILL_SOLIDERS:
            this.stage.kill_soliders()
            continue;
          case CMD.KILL_OTHERS:
            this.stage.kill_others()
            continue;
        }
      }
    }
  }

  update_once() {
    this.transform.update()
    this.update_ui();
    this.handle_keys();
    this.handle_cmds();
    this.update_camera();
    this.bg.update();

    if (this._paused == 1) return;
    if (this._paused == 2) this._paused = 1
    this._game_time.add();

    if (this.stage.world_pause) {
      this.stage.update();
      return;
    }

    const { game_time } = this;
    const { size } = this.entities
    if (size > 355) Ditto.debug(`[World::update_once]entities.size = ${size}`)
    this.gone_entities.length = 0;
    this.v_collisions.length = 0;
    this.a_collisions.clear();
    this._used_itrs.clear()
    this._temp_entitis_set.clear();
    const update_collisions = game_time.value % 2 === 0
    const update_chasing = game_time.value % 8 === 0;
    if (update_chasing) {
      for (const chaser of this._enemy_chasers) {
        const e = chaser.chasing;
        if (!e) continue;
        if (!is_fighter(e) || chaser.is_ally(e) || e.hp <= 0)
          chaser.chasing = null;
      }
      for (const chaser of this._ally_chasers) {
        const e = chaser.chasing;
        if (!e) continue;
        if (!is_fighter(e) || !chaser.is_ally(e) || e.hp <= 0)
          chaser.chasing = null;
      }
    }
    for (const e of this.entities) {
      if (update_chasing && is_fighter(e) && e.hp > 0) {
        for (const chaser of this._enemy_chasers) {
          if (chaser.is_ally(e)) continue;
          const prev = chaser.chasing;
          if (!prev || manhattan_xz(prev, chaser) > manhattan_xz(e, chaser)) {
            chaser.chasing = e;
          }
        }
        for (const chaser of this._ally_chasers) {
          if (!chaser.is_ally(e)) continue;
          const prev = chaser.chasing;
          if (!prev || manhattan_xz(prev, chaser) > manhattan_xz(e, chaser)) {
            chaser.chasing = e;
          }
        }
      }
      e.update();
      if (
        e.frame.id === Builtin_FrameId.Gone ||
        e.frame.state === StateEnum.Gone
      ) {
        this.gone_entities.push(e);
      }
      if (update_collisions) {
        const a_ctrl = e.ctrl
        for (const b of this._temp_entitis_set) {
          const b_ctrl = b.ctrl;
          if (is_bot_ctrl(b_ctrl)) b_ctrl.look_other(e)
          if (is_bot_ctrl(a_ctrl)) a_ctrl.look_other(b)
          const collision1 = this.collision_detection(e, b);
          const collision2 = this.collision_detection(b, e);
          if (collision1?.handlers && collision2?.handlers) {
            const index1 = ALL_ENTITY_ENUM.indexOf(collision1.attacker.type)
            const index2 = ALL_ENTITY_ENUM.indexOf(collision2.attacker.type)
            if (index1 < index2) this.add_collisions(collision1)
            else if (index1 > index2) this.add_collisions(collision2)
            else this.add_collisions(collision1, collision2)
          }
          else if (collision1?.handlers) this.add_collisions(collision1)
          else if (collision2?.handlers) this.add_collisions(collision2)
        }
      }
      this._temp_entitis_set.add(e);
    }
    if (update_collisions) {
      for (const c of this.v_collisions)
        collisions_keeper.handle(c)
      for (const [, c] of this.a_collisions)
        collisions_keeper.handle(c)
    }
    for (const e of this.incorporeities) {
      e.update();
      if (
        e.frame.id === Builtin_FrameId.Gone ||
        e.frame.state === StateEnum.Gone
      ) {
        this.gone_entities.push(e);
      }
    }
    this.del_entities(this.gone_entities);
    this.stage.update();
  }

  render_once(dt: number) {
    this.renderer.render(dt);
  }

  update_camera() {
    const old_cam_x = round(this.renderer.cam_x);
    if (this.bg.id === Defines.VOID_BG.id) {
      this.renderer.cam_x = 0
      if (old_cam_x !== 0) {
        this.callbacks.emit("on_cam_move")(0);
      }
      return;
    }

    const { cam_l, left, cam_r, right } = this.stage;
    const max_cam_left = is_num(this.lock_cam_x) ? left : cam_l;
    const max_cam_right = is_num(this.lock_cam_x) ? right : cam_r;
    let new_x = this.renderer.cam_x;
    let max_speed_ratio = 50;
    let acc_ratio = 1;
    if (is_num(this.lock_cam_x)) {
      new_x = this.lock_cam_x;
    } else if (this.puppets.size) {
      let l = 0;
      new_x = 0;
      /** 存活的本地人类玩家角色 */
      const mines: Entity[] = [];
      /** 存活的人类玩家角色 */
      const humans: Entity[] = [];
      /** 槽中角色 */
      const fighters: Entity[] = []
      for (const [, p] of this.puppets) {
        if (is_human_ctrl(p.ctrl) && p.hp > 0) {
          if (p.ctrl.player.mine) {
            mines.push(p)
          } else {
            humans.push(p)
          }
        }
        else fighters.push(p)
      }
      const follows = mines.length ? mines : humans.length ? humans : fighters
      for (const p of follows) {
        new_x += p.position.x - this.screen_w / 2 + (p.facing * this.screen_w) / 6;
        ++l;
      }
      new_x = round(new_x / l);
    }
    if (new_x < max_cam_left) new_x = max_cam_left;
    if (new_x > max_cam_right - this.screen_w) new_x = max_cam_right - this.screen_w;
    let cur_x = this.renderer.cam_x;
    const acc = min(
      acc_ratio,
      0.5 * (acc_ratio * abs(cur_x - new_x)) / this.screen_w,
    );
    const max_speed = max_speed_ratio * acc;

    if (cur_x > new_x) {
      if (this.cam_speed > 0) this.cam_speed = 0;
      else if (this.cam_speed > -max_speed) this.cam_speed -= acc;
      else this.cam_speed = -max_speed;
      this.renderer.cam_x += this.cam_speed;
      if (this.renderer.cam_x < new_x) this.renderer.cam_x = new_x;
    } else if (cur_x < new_x) {
      if (this.cam_speed < 0) this.cam_speed = 0;
      else if (this.cam_speed < max_speed) this.cam_speed += acc;
      else this.cam_speed = max_speed;
      this.renderer.cam_x += this.cam_speed;
      if (this.renderer.cam_x > new_x) this.renderer.cam_x = new_x;
    }

    const new_cam_x = round(this.renderer.cam_x);
    if (old_cam_x !== new_cam_x) {
      this.callbacks.emit("on_cam_move")(new_cam_x);
    }
  }

  private _temp_entitis_set = new Set<Entity>();
  private _used_itrs = new Set<Entity>()
  add_collisions(...cs: ICollision[]) {
    for (const c of cs) {
      if (c.itr.vrest) {
        this.v_collisions.push(c);
      } else {
        const prev = this.a_collisions.get(c.attacker);
        if (!prev || prev.m_distance > c.m_distance)
          this.a_collisions.set(c.attacker, c);
      }
    }
  }

  collision_detection(a: Entity, b: Entity): ICollision | undefined {
    const af = a.frame;
    const bf = b.frame;
    if (!af.itr?.length || !bf.bdy?.length) return;
    const l0 = af.itr.length;
    const l1 = bf.bdy.length;
    for (let i = 0; i < l0; ++i) {
      for (let j = 0; j < l1; ++j) {
        const itr = af.itr[i]!
        const bdy = bf.bdy[j]!
        const collision = this.collision_test(a, af, itr, b, bf, bdy);
        if (!collision) continue;
        collision.handlers = collisions_keeper.handler(collision)
        return collision
      }
    }
  }

  collision_test(
    attacker: Entity,
    aframe: IFrameInfo,
    itr: IItrInfo,
    victim: Entity,
    bframe: IFrameInfo,
    bdy: IBdyInfo,
  ): ICollision | undefined {

    if (!itr.vrest && attacker.a_rest) return;
    if (itr.kind !== ItrKind.Heal) {
      const b_catcher = victim.catcher;
      if (victim.blinking || victim.invisible || victim.invulnerable) return;
      if (b_catcher && b_catcher.frame.cpoint?.hurtable !== 1) return;
    }
    switch (aframe.state) {
      case StateEnum.Weapon_OnHand: {
        const atk = attacker.holder?.frame.wpoint?.attacking;
        if (!atk) return;
        const itr_prefab = attacker.data.itr_prefabs?.[atk];
        if (!itr_prefab) return;
        itr = { ...itr, ...itr_prefab };
        break;
      }
    }

    const a_cube = this.get_bounding(attacker, aframe, itr);
    const b_cube = this.get_bounding(victim, bframe, bdy);
    if (!(
      a_cube.left <= b_cube.right &&
      a_cube.right >= b_cube.left &&
      a_cube.bottom <= b_cube.top &&
      a_cube.top >= b_cube.bottom &&
      a_cube.far <= b_cube.near &&
      a_cube.near >= b_cube.far
    )) return;

    const ally_flag = attacker.is_ally(victim) ? HitFlag.Ally : HitFlag.Enemy;
    if (
      !(itr.hit_flag & victim.data.type) ||
      !(bdy.hit_flag & attacker.data.type) ||
      !(itr.hit_flag & ally_flag) &&
      !(bdy.hit_flag & ally_flag)
    ) return;
    if (
      victim.team === attacker.team &&
      victim.pre_emitter === attacker.pre_emitter &&
      victim.spawn_time === attacker.spawn_time
    ) return;

    if (!itr.vrest && attacker.a_rest) return;
    if (itr.vrest && victim.get_v_rest(attacker.id) > 0) return;
    const ax = attacker.position.x
    const ay = attacker.position.y
    const az = attacker.position.z
    const vx = victim.position.x
    const vy = victim.position.y
    const vz = victim.position.z
    const dx = vx - ax
    const dy = vy - ay
    const dz = vz - az
    const collision: ICollision = {
      lf2: this.lf2,
      world: this,
      v_rest: !itr.arest && itr.vrest ? itr.vrest + this.vrest_offset : void 0,
      victim,
      attacker,
      itr,
      bdy,
      aframe,
      bframe,
      a_cube,
      b_cube,
      ax,
      ay,
      az,
      vx,
      vy,
      vz,
      dx,
      dy,
      dz,
      m_distance: abs(dx) + abs(dy) + abs(dz)
    };
    if (
      bdy.tester?.run(collision) === false ||
      itr.tester?.run(collision) === false
    ) return;

    return collision
  }

  /**
   * 火花特效
   *
   * @param {number} x x坐标
   * @param {number} y y坐标
   * @param {number} z z坐标
   * @param {string} f 帧ID
   * @return {void}
   * @memberof World
   */
  spark(x: number, y: number, z: number, f: string): void {
    if (!this._spark_data)
      this._spark_data = this.lf2.datas.find(Defines.BuiltIn_Dats.Spark);
    const data = this._spark_data
    if (!data) {
      Ditto.warn(`[${World.TAG}::spark] "${Defines.BuiltIn_Dats.Spark}" data not found!`);
      return;
    }
    const e = Factory.inst.create_entity(data.type, this, data);
    if (!e) {
      Ditto.warn(`[${World.TAG}::spark] failed`);
      return;
    }
    e.position.set(round(x), round(y), round(z));
    e.enter_frame({ id: f });
    e.attach(false);
  }
  etc(x: number, y: number, z: number, f: string): void {
    if (!this._etc_data) this._etc_data = this.lf2.datas.find(O_ID.Etc);
    const data = this._etc_data;
    if (!data) {
      Ditto.warn(`[${World.TAG}::etc] oid "${O_ID.Etc}" data not found!`);
      return;
    }
    const e = Factory.inst.create_entity(data.type, this, data)
    if (!e) {
      Ditto.warn(`[${World.TAG}::etc] failed`);
      return;
    }
    e.position.set(round(x), round(y), round(z));
    e.enter_frame({ id: f });
    e.attach(false);
  }
  get_bounding(e: Entity, f: IFrameInfo, i: IItrInfo | IBdyInfo): IBounding {
    const left =
      e.facing > 0
        ? e.position.x - f.centerx + i.x
        : e.position.x + f.centerx - i.x - i.w;
    const top = e.position.y + f.centery - i.y;
    const far = e.position.z + i.z;
    return {
      left: round(left),
      right: round(left + i.w),
      top: round(top),
      bottom: round(top - i.h),
      far: round(far),
      near: round(far + i.l),
    };
  }

  private _ideally_dt: number = round(1000 / 60);
  private _playrate: number = 1;

  get playrate() {
    return this._playrate;
  }
  set playrate(v: number) {
    if (v <= 0) throw new Error("playrate must be larger than 0");
    if (v === this._playrate) return;
    this._playrate = v;
    this._ideally_dt = round(1000 / 60) / this._playrate;
    this.start_update();
  }

  private _paused: 0 | 1 | 2 = 0;
  get paused() { return this._paused == 1; }
  set paused(v: boolean) { this.set_paused(v ? 1 : 0); }
  indicator_flags: number = 0;

  protected set_paused(v: 0 | 1 | 2) {
    if (this._paused === v) return;
    const changed = (!v) !== (!this._paused)
    this._paused = v;
    if (changed) this.callbacks.emit("on_pause_change")(!!v);
  }

  dispose() {
    this.callbacks.emit("on_disposed")();
    this.stop_update();
    this.stop_render();
    this.del_entities(Array.from(this.entities));
    this.renderer.dispose();
    this.callbacks.clear()
  }

  get_ground(position: IVector3) {
    return this.ground;
  }
  ground = new Ground()
}