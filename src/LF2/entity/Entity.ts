import { Factory } from "../Factory";
import { IWorldDataset } from "../IWorldDataset";
import type { LF2 } from "../LF2";
import type { World } from "../World";
import { Callbacks } from "../base";
import { Buff } from "../buff/Buff";
import { Collision } from "../collision/Collision";
import { BaseController } from "../controller/BaseController";
import { InvalidController } from "../controller/InvalidController";
import {
  Builtin_FrameId,
  Defines,
  EMPTY_FRAME_INFO,
  EntityEnum, EntityGroup, FacingFlag,
  GK,
  GONE_FRAME_INFO,
  HitFlag,
  IArmorInfo,
  IBdyInfo, IBounding, ICpointInfo, IDeadJoin, IEntityData,
  IFrameInfo, IItrInfo, INextFrame, INextFrameResult, IOpointInfo, IPos,
  is_independent, ItrKind, IVector3,
  IVelocityInfo, IWpointInfo,
  StateEnum, TEntityEnum, TFace, TNextFrame,
  WpointKind
} from "../defines";
import { Ditto } from "../ditto";
import { States } from "../state";
import { ENTITY_STATES } from "../state/ENTITY_STATES";
import { State_Base } from "../state/State_Base";
import { abs, clamp, clamp_add, find, float_equal, max, min, round, round_float } from "../utils";
import { Times } from "../utils/Times";
import { cross_bounding } from "../utils/cross_bounding";
import { is_f_num, is_positive, is_str } from "../utils/type_check";
import { DrinkInfo } from "./DrinkInfo";
import type IEntityCallbacks from "./IEntityCallbacks";
import { IEntitySnapshot } from "./IEntitySnapshot";
import { StatBarType } from "./StatBarType";
import { summary_mgr } from "./SummaryMgr";
import { turn_face } from "./face_helper";
import { is_fighter, is_human_ctrl } from "./type_check";

// 拆分出的功能模块 — 通过 prototype 挂载
import * as EntityPhysics from "./EntityPhysics";
import * as EntityRecovery from "./EntityRecovery";
import * as EntitySpawn from "./EntitySpawn";
import { EnterFrameResult } from "./EnterFrameResult";

export class Entity {
  static readonly TAG: string = 'Entity';
  lf2: LF2;
  world: World;
  id: string = '';
  wait: number = 0;
  variant: number = 0;
  transforms: [string, string] | null = null;
  protected _lifetime: number = 0;
  protected _spawn_time: number = 0;

  protected _render_effect_time: number = 0;
  protected _outline_color: string = '';
  protected _outline_alpha: number = 0.8;
  protected _outline_width: number = 1;
  protected _outline_enabled: number | null = null;
  protected _mix_color: string = '';
  protected _mix_strength: number = 0;
  protected _greyscale: number = 0;

  protected readonly _prev_position: IVector3 = Ditto.vec3(0, 0, 0);
  protected readonly _position: IVector3 = Ditto.vec3(0, 0, 0);
  protected readonly _prev_velocity: IVector3 = Ditto.vec3(0, 0, 0);
  protected readonly _velocity: IVector3 = Ditto.vec3(0, 0, 0);
  protected readonly _temp_v: IVector3 = Ditto.vec3(0, 0, 0);

  /**
   * 影分身
   */
  protected readonly copies = new Set<string>();
  protected readonly vrests = new Map<string, Collision>();
  readonly blockers = new Map<string, Collision>();
  readonly superpunchs = new Map<string, Collision>();
  readonly callbacks = new Callbacks<IEntityCallbacks>()
  protected readonly _emitters: string[] = [];

  protected _data: IEntityData;
  protected _reserve: number = 0;
  protected _mounted: number = 0;
  protected _ghosted: number = 0;
  protected _landing_frame!: IFrameInfo | null;
  protected readonly _hp_r_tick: Times = new Times();
  protected readonly _mp_r_tick: Times = new Times();
  public drink: DrinkInfo | null = null;
  public fuse_bys: Entity[] | null = null;
  public dismiss_time: number | null = null;
  public dismiss_data: IEntityData | null = null;

  protected _stat_bar_type!: StatBarType | null;
  protected _resting: number = 0;
  protected _resting_max: number | null = null
  protected _toughness: number = 0;
  protected _toughness_max: number = 0;
  protected _toughness_resting: number = 0;
  protected _toughness_resting_max: number = 0;
  protected _fall_value: number = 0;
  protected _fall_value_max: number | null = null
  protected readonly _fall_r_tick: Times = new Times();
  protected _fall_r_value: number = 0;
  protected _defend_value: number = 0;
  protected _defend_value_max: number | null = null
  protected readonly _defend_r_tick: Times = new Times();
  protected _defend_r_value: number = 0;
  protected _healing: number = 0;
  protected _defend_ratio: number | null = null
  public fallinjury: number = 0;
  public throwinjury: number = 0;
  public facing: TFace = 1;
  public frame: Readonly<IFrameInfo> = GONE_FRAME_INFO;
  protected _prev_frame: Readonly<IFrameInfo> = GONE_FRAME_INFO;
  protected _catching: Entity | null = null;
  protected _catcher: Entity | null = null;
  protected _states: States;
  protected readonly _next_frame_by_id: INextFrame = { id: '' };
  aabb_min_x: number = 0;
  aabb_max_x: number = 0;
  aabb_min_z: number = 0;
  aabb_max_z: number = 0;
  /**
   * 实体名称
   *
   * @protected
   * @type {string|null}
   */
  protected _name: string | null = null;

  /**
   * 所属队伍
   *
   * @protected
   * @type {string}
   */
  protected _team!: string;
  protected _mp: number = 0;
  protected _mp_max: number | null = null;
  protected _hp: number = 0;
  protected _hp_r: number = 0;
  protected _hp_max: number | null = null;
  protected _bearer: Entity | null = null;
  protected _holding: Entity | null = null;
  protected _arest: number = 0;
  public motionless: number = 0;
  public shaking: number = 0;

  /**
   * 抓人剩余值
   *
   * 当抓住一个被击晕的人时，此值充满。
   */
  protected _catch_time: number = 0;
  protected _catch_time_max: number | null = null;

  /**
   * 隐身计数，每帧-1
   *
   * @protected
   * @type {number}
   */
  protected _invisible_duration: number = 0;

  /**
   * 无敌时间计数，每帧-1
   *
   * @protected
   * @type {number}
   */
  protected _invulnerable_duration: number = 0;

  /**
   * 闪烁计数，每帧-1
   *
   * @protected
   * @type {number}
   */
  protected _blinking_duration: number = 0;

  /**
   * 闪烁完毕后下一动作
   *
   * @protected
   * @type {string}
   */
  protected _after_blink!: string | null;

  protected _state!: State_Base | null;
  protected _key_role!: boolean | null;
  protected _name_visible!: boolean | null;
  protected _wakeup_invuln!: boolean | null;
  protected _dead_gone!: boolean | null;
  protected _dead_join!: IDeadJoin | null;
  protected _ctrl_visible!: boolean | null;
  protected _ctrl!: BaseController;
  armor!: Readonly<IArmorInfo> | null;
  protected _opoints!: [IOpointInfo, number][];
  private prev_cpoint_a!: ICpointInfo | null;


  /**
   * 最近一次被攻击信息
   *
   * @type {Collision}
   * @memberof Entity
   */
  lastest_collided!: Collision | null;

  /**
   * 当前tick碰撞信息
   *
   * - 会在update后置空
   *
   * @type {Collision[]}
   * @memberof Entity
   */
  readonly collision_list: Collision[] = [];

  /**
   * 当前tick被碰撞信息
   *
   * - 会在update后置空
   *
   * @type {Collision[]}
   * @memberof Entity
   */
  readonly collided_list: Collision[] = [];

  protected _ground_y: number = 0;
  protected _prev_ground_y: number = 0;
  readonly buffs = new Map<string, Buff>()

  renderer: any;
  puppet: boolean = false;
  jumping = { s: 0, x: 0, y: 0, z: 0, t: 0 }
  protected _atom_time: number; // 帧时间步长（被 Physics/Recovery/Spawn 子模块访问）

  get lifetime() {
    return this._lifetime
  }
  get render_effect_time() {
    return this._render_effect_time
  }
  get outline_color(): string {
    return this._outline_color || Defines.TeamInfoMap[this.team]?.outline_color || ''
  };
  set outline_color(v: string) { this._outline_color = v; this._render_effect_time++; }
  get outline_alpha(): number { return this._outline_alpha; }
  set outline_alpha(v: number) { this._outline_alpha = v; this._render_effect_time++; }
  get outline_width(): number { return this._outline_width; }
  set outline_width(v: number) { this._outline_width = v; this._render_effect_time++; }
  get outline_enabled(): number | null { return this._outline_enabled ?? this.dataset('outline_enabled'); }
  set outline_enabled(v: number | null) { this._outline_enabled = v; this._render_effect_time++; }
  get mix_color(): string { return this._mix_color; }
  set mix_color(v: string) { this._mix_color = v; this._render_effect_time++; }
  get mix_strength(): number { return this._mix_strength; }
  set mix_strength(v: number) { this._mix_strength = v; this._render_effect_time++; }
  get greyscale(): number { return this._greyscale; }
  set greyscale(v: number) { this._greyscale = v; this._render_effect_time++; }


  get position(): Readonly<IVector3> { return this._position }
  get prev_position(): Readonly<IVector3> { return this._prev_position }

  get ground_y(): number { return this._ground_y }
  get prev_ground_y(): number { return this._prev_ground_y }

  get velocity(): Readonly<IVector3> { return this._velocity }
  get data(): IEntityData { return this._data };
  get group() { return this._data.base.group };
  get mounted() { return this._mounted }
  get ghosted() { return this._ghosted }
  get reserve(): number { return this._reserve; }
  set reserve(v: number) {
    const o = this._reserve;
    if (o === v) return;
    this._reserve = v;
    this.callbacks.emit("on_reserve_changed")(this, v, o);
  }

  get type(): TEntityEnum { return this._data.type; }
  get itr(): IItrInfo[] | undefined { return this.frame.itr; }
  get bdy(): IBdyInfo[] | undefined { return this.frame.bdy; }
  get toughness_resting_max(): number { return this._toughness_resting_max; }
  set toughness_resting_max(v: number) {
    const o = this._toughness_resting_max;
    if (o === v) return;
    this._toughness_resting_max = v;
  }
  get resting_max(): number { return this._resting_max ?? this.world.resting_max; }
  set resting_max(v: number) {
    const o = this.resting_max;
    if (o === v) return;
    this._resting_max = v;
    this.callbacks.emit("on_resting_max_changed")(this, v, o);
  }
  get resting() { return this._resting; }
  set resting(v: number) {
    const o = this._resting;
    if (o === v) return;
    this._resting = v;
    this.callbacks.emit("on_resting_changed")(this, v, o);
  }
  get fall_value(): number { return this._fall_value; }
  set fall_value(v: number) {
    const o = this._fall_value;
    if (o === v) return;
    this._fall_value = round_float(v);
    if (v < o) {
      this.resting = this.resting_max;
      this.toughness_resting = this.toughness_resting_max;
    }
    this.callbacks.emit("on_fall_value_changed")(this, v, o);
  }

  get toughness(): number { return this._toughness; }
  set toughness(v: number) {
    if (v < 0) v = 0;
    const o = this._toughness;
    if (o === v) return;
    this._toughness = v;
    if (v < o) this.toughness_resting = this.toughness_resting_max;
    this.callbacks.emit("on_toughness_changed")(this, v, o);
  }

  get toughness_max(): number { return this._toughness_max; }
  set toughness_max(v: number) {
    if (v < 0) v = 0;
    const o = this._toughness_max;
    if (o === v) return;
    this._toughness_max = v;
    this.callbacks.emit("on_toughness_max_changed")(this, v, o);
  }
  get toughness_resting() { return this._toughness_resting; }
  set toughness_resting(v: number) {
    const o = this._toughness_resting;
    if (o === v) return;
    this._toughness_resting = v;
  }
  get catch_time_max(): number { return this._catch_time_max ?? this.world.catch_time_max; }
  set catch_time_max(v: number) {
    const o = this.catch_time_max;
    if (o === v) return;
    this._catch_time_max = v;
    this.callbacks.emit("on_catch_time_max_changed")(this, v, o);
  }
  get fall_value_max(): number { return this._fall_value_max ?? this.world.fall_value_max; }
  set fall_value_max(v: number) {
    const o = this.fall_value_max;
    if (o === v) return;
    this._fall_value_max = v;
    this.callbacks.emit("on_fall_value_max_changed")(this, v, o);
  }
  get defend_value(): number { return this._defend_value; }
  set defend_value(v: number) {
    const o = this._defend_value;
    if (o === v) return;
    this._defend_value = round_float(v);
    if (v < o) {
      this.resting = this.resting_max;
      this.toughness_resting = this.toughness_resting_max;
    }
    this.callbacks.emit("on_defend_value_changed")(this, v, o);
  }
  get defend_value_max(): number { return this._defend_value_max ?? this.world.defend_value_max }
  set defend_value_max(v: number) {
    const o = this.defend_value_max;
    if (o === v) return;
    this._defend_value_max = v;
    this.callbacks.emit("on_defend_value_max_changed")(this, v, o);
  }
  get healing(): number { return this._healing; }
  set healing(v: number) {
    if (this._hp_r === this._hp) v = 0
    const o = this._healing;
    if (o === v) return;
    this._healing = v;
    this.callbacks.emit("on_healing_changed")(this, v, o);
  }

  get defend_ratio(): number { return this._defend_ratio ?? this.world.defend_ratio; }
  set defend_ratio(v: number) {
    const o = this.defend_ratio;
    if (o === v) return;
    this._defend_ratio = v;
  }


  get stat_bar_type(): number {
    let r = this._stat_bar_type;
    if (r !== null) return r;
    return this.key_role ? StatBarType.Float : StatBarType.None
  }

  set stat_bar_type(v: number) {
    this._stat_bar_type = v;
  }

  get catching() {
    return this._catching;
  }
  get catcher() {
    return this._catcher;
  }
  get bearer(): Entity | null {
    return this._bearer;
  }

  set bearer(v: Entity | null) {
    this.set_bearer(v);
  }

  get holding(): Entity | null {
    return this._holding;
  }

  set holding(v: Entity | null) {
    this.set_holding(v);
  }

  get name(): string {
    if (this._name !== null)
      return this._name;
    const { ctrl } = this;
    if (is_human_ctrl(ctrl))
      return ctrl.player.name || `Player ${ctrl.player.id}`
    return this.data.base.name ?? ''
  }

  set name(v: string | null) {
    if (v === this.name) return;
    const o = this._name;
    this._name = v;
    this.callbacks.emit("on_name_changed")(this, v || '', o);
  }

  get mp(): number {
    return this._mp;
  }
  set mp(v: number) {
    const o = this._mp;
    v = max(0, v)
    v = round_float(v)
    if (o === v) return;
    this._mp = v
    if (v < o) summary_mgr.get(this.id).mp_usage += o - v;
    if (v < o && !is_independent(this.team)) summary_mgr.get(this.team).mp_usage += o - v;
    this.callbacks.emit("on_mp_changed")(this, v, o);
    if (o > 0 && v <= 0) {
      const nf = this.frame.on_exhaustion ?? this._data.on_exhaustion;
      if (nf) this.enter_frame(nf);
    }
  }

  get hp_r(): number {
    return this._hp_r;
  }
  set hp_r(v: number) {
    const o = this._hp_r;
    v = max(0, v)
    v = round_float(v)
    if (o === v) return;
    this.callbacks.emit("on_hp_r_changed")(this, (this._hp_r = v), o);
  }

  get hp(): number {
    return this._hp;
  }
  set hp(v: number) {
    const o = this._hp;
    v = max(0, v)
    v = round_float(v)
    if (o === v) return;
    this._hp = v;
    if (v < o) summary_mgr.get(this.id).hp_lost += o - v;
    if (v < o && !is_independent(this.team)) summary_mgr.get(this.team).hp_lost += o - v;

    this.callbacks.emit("on_hp_changed")(this, v, o);
    if (o > 0 && v <= 0) {
      this.callbacks.emit("on_dead")(this);
      this._state?.on_dead?.(this);
      if (
        this.state !== StateEnum.Gone &&
        this.frame.id !== Builtin_FrameId.Gone &&
        this._data.base.brokens?.length
      ) {
        this.apply_opoints(this._data.base.brokens);
        this.play_sound(this._data.base.dead_sounds);
      }
      const nf = this.frame.on_dead ?? this._data.on_dead;
      if (nf) this.enter_frame(nf);
    }

    if (v > this._hp_r) {
      this.hp_r = v
    }
  }
  get mp_max(): number {
    return this._mp_max ?? this.world.mp_max;
  }
  set mp_max(v: number) {
    const o = this.mp_max;
    v = max(0, v)
    v = round_float(v)
    if (v === o) return;
    this.callbacks.emit("on_mp_max_changed")(this, (this._mp_max = v), o);
  }

  get hp_max(): number {
    return this._hp_max ?? this.world.hp_max;
  }
  set hp_max(v: number) {
    const o = this.hp_max;
    v = max(0, v)
    v = round_float(v)
    if (v === o) return;
    this.callbacks.emit("on_hp_max_changed")(this, (this._hp_max = v), o);
  }

  /**
   * 所属队伍
   *
   * @type {string}
   * @memberof Entity
   */
  get team(): string {
    return this._team;
  }

  /**
   * 所属队伍
   *
   * @type {string}
   * @memberof Entity
   */
  set team(v) {
    const o = this._team;
    this._team = v;
    this.variant = Number(this._team) || 0
    this.callbacks.emit("on_team_changed")(this, v, o);
    ++this._render_effect_time;
  }

  get src_emitter(): Entity | undefined { return this.get_emitter(0) }
  get pre_emitter(): Entity | undefined { return this.get_emitter(this.emitters.length - 1) }
  get emitters(): string[] { return this._emitters; }

  /**
   * 闪烁计数
   *
   * @readonly
   * @type {number}
   */
  get blinking() {
    return this._blinking_duration;
  }
  set blinking(v: number) {
    this._blinking_duration = max(0, v);
  }

  /**
   * 隐身计数
   *
   * @readonly
   * @type {number}
   */
  get invisible() {
    return this._invisible_duration;
  }
  set invisible(v: number) {
    this._invisible_duration = max(0, v);
  }

  /**
   * 无敌计数
   *
   * @readonly
   * @type {number}
   */
  get invulnerable() {
    return this._invulnerable_duration;
  }
  set invulnerable(v: number) {
    this._invulnerable_duration = max(0, v);
  }

  get ctrl(): BaseController {
    return this._ctrl;
  }
  set ctrl(v: BaseController | undefined) {
    if (!v) return;
    if (this._ctrl === v) return;
    const prev = this._ctrl
    this._ctrl = v;
    this.callbacks.emit('on_ctrl_changed')(v, prev, this)
  }
  get key_role(): boolean {
    if (this._key_role !== null) return this._key_role;
    if (this.ctrl.player) return this._key_role = true;
    const { group } = this._data.base
    if (!group?.length) return false;
    for (let i = 0; i < group.length; ++i) {
      if (
        group[i] == EntityGroup.Regular ||
        group[i] == EntityGroup.Boss
      ) return this._key_role = true
    }
    return this._key_role = false;
  }
  set key_role(v: boolean | null) {
    if (this._key_role === v) return;
    this._key_role = v;
  }
  get name_visible(): boolean {
    return this._name_visible ?? this.key_role;
  }
  set name_visible(v: boolean | null) {
    this._name_visible = v;
  }
  /** 是否有起身无敌 */
  get wakeup_invuln(): boolean {
    return this._wakeup_invuln ?? this.key_role
  }
  set wakeup_invuln(v: boolean) {
    this._wakeup_invuln = v;
  }

  get dead_gone(): boolean {
    if (this._dead_gone !== null) return this._dead_gone;
    return !this.key_role;
  }
  set dead_gone(v: boolean | null) {
    if (this._dead_gone === v) return;
    this._dead_gone = v;
  }
  get dead_join() {
    return this._dead_join
  }
  set dead_join(v) {
    this._dead_join = v
  }

  get spawn_time() { return this._spawn_time }
  get gravity(): number {
    const g1 = this._state?.get_gravity?.(this);
    const g2 = this.ctrl.is_end(GK.Defend) ?
      this.dataset('gravity') :
      this.dataset('gravity_d')
    return g1 ?? g2
  }
  get itr_motionless(): number {
    if (this.type === EntityEnum.Ball)
      return this.dataset('ball_itr_motionless')
    return this.dataset('itr_motionless')
  }
  get arest(): number {
    return this._arest;
  }
  set arest(v: number) {
    if (v == this._arest) return;
    this._arest = round_float(v);
  }
  get strength(): number {
    return this.data.base.strength ?? 1;
  }
  get weight(): number {
    return this.data.base.weight ?? 1;
  }
  get base_type(): number {
    return this.data.base.type ?? 0
  }
  get ctrl_visible(): boolean | null {
    return this._ctrl_visible
  }
  set ctrl_visible(v: boolean | null) {
    this._ctrl_visible = v;
  }
  get state() { return this.frame.state }
  constructor(world: World, data: IEntityData, states: States = ENTITY_STATES) {
    this.world = world;
    this.lf2 = world.lf2;
    this._data = data;
    this._states = states;
    this._atom_time = world.atom_time;
    this.reset(data, states)
  }
  reset(data: IEntityData, states: States = ENTITY_STATES) {
    let buffs = Array.from(this.buffs.values())
    for (const buf of buffs) buf.del_victims(this.id)
    this.buffs.clear();
    const { world, lf2 } = this;
    this._data = data;
    this.id = lf2.new_id;
    this.wait = 0;
    this._lifetime = 0;
    this._prev_ground_y = 0;
    this.fallinjury = 0;
    this._ground_y = 0;
    this.variant = 0;
    this.transforms = null;
    this._reserve = 0
    this._mounted = 0;
    this._ghosted = 0;
    this._position.set(0, 0, 0)
    this._prev_position.set(0, 0, 0)
    this.fuse_bys = null;
    this.dismiss_time = null;
    this.dismiss_data = null;
    this.copies.clear()
    this._stat_bar_type = null;
    this._toughness_resting_max = Defines.DEFAULT_TOUGHNESS_RESTING_MAX;
    this._resting_max = data.base.resting_max ?? null;
    this._resting = 0;
    this._toughness = 0;
    this._toughness_max = 0;
    this._toughness_resting = 0;
    this._fall_value_max = data.base.fall_value_max ?? null;
    this._defend_value_max = data.base.defend_value_max ?? null;
    this._defend_ratio = data.base.defend_ratio ?? null;
    this._healing = 0;
    this._catch_time_max = data.base.catch_time_max ?? null;
    this.throwinjury = 0;
    this.facing = 1;
    this.frame = EMPTY_FRAME_INFO;
    this._prev_frame = EMPTY_FRAME_INFO;
    this._catching = null
    this._catcher = null
    this._wakeup_invuln = null;
    this._name_visible = null;
    this._outline_alpha = 0.8;
    this._velocity.set(0, 0, 0)
    this._prev_velocity.set(0, 0, 0);
    this.callbacks.clear();
    this._name = null
    this._team = world.lf2.new_team;
    this._landing_frame = null;
    this._bearer = null;
    this._holding = null;
    this._emitters.length = 0;
    this._arest = 0;
    this.vrests.clear()
    this.blockers.clear()
    this.superpunchs.clear()
    this.motionless = 0;
    this.shaking = 0;
    this._states = states;
    this._hp_r_tick.max = world.hp_r_ticks;
    this._hp_r_tick.value = 0;

    this._mp_r_tick.max = world.mp_r_ticks;
    this._mp_r_tick.value = 0;

    this._fall_r_tick.max = world.fall_r_ticks;
    this._fall_r_tick.value = 0;

    this._defend_r_tick.max = world.defend_r_ticks;
    this._defend_r_tick.value = 0;

    this._defend_r_value = world.defend_r_value;
    this._fall_r_value = world.fall_r_value;
    this._hp_max = data.base.hp_max ?? null;
    this._ctrl = new InvalidController("", this);
    this._mp_max = data.base.mp_max ?? null;
    this._defend_ratio = data.base.defend_ratio ?? null
    this.jumping.s = 0
    this.jumping.x = 0
    this.jumping.y = 0
    this.jumping.z = 0
    this.jumping.t = 0

    const { armor } = this._data.base
    this.armor = armor || null;
    if (armor) this.toughness = this.toughness_max = armor.toughness;
    this.fall_value = this.fall_value_max;
    this.defend_value = this.defend_value_max;
    this._hp = this._hp_r = this.hp_max;
    this._mp = this.mp_max;
    this._catch_time = this.catch_time_max;
    this._invisible_duration = 0;
    this._invulnerable_duration = 0;
    this._blinking_duration = 0;
    this._after_blink = null;
    this._state = null;
    this._key_role = null;
    this._dead_gone = null;
    this._dead_join = null;
    this._ctrl_visible = null;
    this.drink = data.base.drink ? new DrinkInfo(data.base.drink) : null
    this._opoints = [];
    this.prev_cpoint_a = null;
    this.collision_list.length = 0;
    this.collided_list.length = 0;
    this.lastest_collided = null;
    this._outline_color = '';
    this._outline_alpha = 0.8;
    this._outline_width = 1;
    this._outline_enabled = null;
    this._mix_color = '';
    this._mix_strength = 0;
    this._greyscale = 0;
    this._render_effect_time = 0;
  }

  set_bearer(v: Entity | null): this {
    if (this._bearer === v) return this;
    const old = this._bearer;
    this._bearer = v;
    this.callbacks.emit("on_holder_changed")(this, v, old);
    return this;
  }

  set_holding(v: Entity | null): this {
    if (this._holding === v) return this;
    const old = this._holding;
    this._holding = v;
    this.callbacks.emit("on_holding_changed")(this, v, old);
    return this;
  }

  find_auto_frame(): IFrameInfo {
    return (
      this._state?.get_auto_frame?.(this) ?? this._data.frames["0"] ?? this.frame
    ); // FIXME: fix this 'as'.
  }

  on_spawn(
    _emitter: Entity,
    _opoint: IOpointInfo,
    _offset_velocity: IVector3 = Ditto.vec3(0, 0, 0),
    _facing: TFace = 1,
  ): this {
    /* → EntitySpawn.ts */ return this;
  }
  get_opoint_speed_z(_emitter: Entity, _opoint: IOpointInfo): number {
    /* → EntitySpawn.ts */ return 0;
  }
  set_state(state_code: number) {
    const v = this._states.get(state_code) || this._states.fallback(this._data.type, state_code);
    if (this._state === v) return;
    this._state?.leave?.(this, this.frame);
    this._state = v || null;
    this._state?.enter?.(this, this.get_prev_frame());
  }

  set_frame(v: IFrameInfo) {
    if (v.id === GONE_FRAME_INFO.id) {
      this._opoints.length = 0
    } else {
      for (let i = 0; i < this._opoints.length; ++i) {
        const { interval_mode, interval_id } = this._opoints[i]![0];
        if (interval_mode === 1) {
          const exists = !!find(v.opoint, o => o.interval_id === interval_id)
          if (!exists) {
            this._opoints.splice(i, 1)
            --i
          }
        } else {
          this._opoints.splice(i, 1)
          --i
        }
      }
    }
    this._prev_frame = this.frame;
    this.frame = v;
    if (!v.itr?.length) this.arest = 0
    const prev_state_code = this._prev_frame.state;
    const next_state_code = this.state;
    if (prev_state_code !== next_state_code) {
      this.set_state(next_state_code)
    }
    if (v.invisible) this.invisibility(v.invisible);
    if (v.opoint) this.apply_opoints(v.opoint);
    if (!v.cpoint) {
      this._catching = null;
      this._catcher = null;
    }
    if (v.broadcasts?.length)
      for (const m of v.broadcasts)
        this.lf2.broadcast(m)
  }

  apply_opoints(_opoints: IOpointInfo[]): void {
    /* → EntitySpawn.ts */
  }

  spawn_entity(
    _opoint: IOpointInfo,
    _offset_velocity: IVector3 = Ditto.vec3(0, 0, 0),
    _facing: TFace = 1,
  ): Entity | undefined {
    /* → EntitySpawn.ts */ return;
  }

  attach(_is_entity = true): this {
    /* → EntitySpawn.ts */ return this;
  }

  /**
   * 实体响应地面速度衰减（x轴方向与z轴方向的速度）的衰减
   *
   * 速度衰减逻辑如下，
   * - ```v *= 当前衰减系数*世界摩擦系数```
   * - ```v -= 世界摩擦力（使v向0的方向变化，直至归0）```
   *
   * 以下情况不响应:
   * - 实体处于地面以上(不含地面，即：position.y > ground_y）
   * - 角色处于shaking中（即实体被某物击中, see IItrInfo.shaking）
   * - 角色处于motionless中，（即实体击中某物时, see IItrInfo.motionless）
   *
   * @see {IItrInfo.shaking} 目标停顿值
   * @see {IItrInfo.motionless} 自身停顿值
   * @see {World.friction_factor} 世界摩擦系数
   * @see {World.friction} 世界摩擦力
   *
   * @param {number} [factor=1] 当前衰减系数
   */
  handle_ground_velocity_decay(factor: number = 1): void {
    /* → EntityPhysics.ts */
  }

  handle_velocity_decay(accx: number, accz: number = accx, factor: number = 1): void {
    /* → EntityPhysics.ts */
  }

  handle_gravity(): void {
    /* → EntityPhysics.ts */
  }
  get dvx(): number {
    /* → EntityPhysics.ts */ return 0;
  }
  get dvy(): number {
    /* → EntityPhysics.ts */ return 0;
  }
  get dvz(): number {
    /* → EntityPhysics.ts */ return 0;
  }
  update_velocity(vinfo: IVelocityInfo): void {
    /* → EntityPhysics.ts */
  }

  dismiss_fusion(frame_id: string): void {
    /* → EntityRecovery.ts */
  }

  find_align_frame(
    _frame_id: string,
    _src: string[] | undefined | null,
    _dst: string[] | undefined | null
  ): INextFrame {
    /* → EntityRecovery.ts */ return { id: "" };
  }

  stat_recovering(): void {
    /* → EntityRecovery.ts */
  }

  drop_holding(): void {
    /* → EntityRecovery.ts */
  }

  hp_recovering(): void {
    /* → EntityRecovery.ts */
  }

  mp_recovering(): void {
    /* → EntityRecovery.ts */
  }

  check_fusion_dismissing(): boolean {
    /* → EntityRecovery.ts */ return false;
  }

  update(): void {
    this._atom_time = this.world.atom_time;
    const rf = round_float;
    this._lifetime += 1;
    if (this.frame.facing) this.facing = this.handle_facing_flag(this.frame.facing)
    if (this.check_fusion_dismissing()) return;
    this.hp_recovering()
    this.mp_recovering();

    if (this.frame.hp_max) this.hp -= this.frame.hp_max * this._atom_time;

    if (this.shaking <= 0 || 0 == this.dataset('vrest_after_shaking'))
      this.vrests.forEach((v, k) => {
        if (v.rest > 0) {
          v.rest = rf(v.rest - this._atom_time);
          if (v.rest < 0) v.rest = 0;
        } else {
          this.del_v_rest(k)
        }
      })

    if (0 == this.dataset('arest_after_motionless') || this.motionless <= 0) {
      if (this.arest > 0) {
        this.arest = rf(this.arest - this._atom_time);
        if (this.arest < 0) this.arest = 0;
      } else {
        this.arest = 0
      }
    }

    if (this._invisible_duration > 0) {
      this._invisible_duration = rf(this._invisible_duration - this._atom_time);
      if (this._invisible_duration <= 0) {
        this._invisible_duration = 0;
        this._blinking_duration = this.dataset('invisible_blinking');
      }
    }
    if (this._invulnerable_duration > 0) {
      this._invulnerable_duration = rf(this._invulnerable_duration - this._atom_time);
      if (this._invulnerable_duration < 0) this._invulnerable_duration = 0;
    }

    if (this._blinking_duration > 0) {
      this._blinking_duration = rf(this._blinking_duration - this._atom_time);
      if (this._blinking_duration <= 0) {
        this._blinking_duration = 0;
        if (this._after_blink === Builtin_FrameId.Gone) {
          this.frame = GONE_FRAME_INFO;
          this.arest = 0;
        } else if (this._after_blink === Builtin_FrameId.Respawn) {
          this.hp = this.hp_r = this.hp_max;

          let max_distance = Number.MAX_SAFE_INTEGER
          let friend: Entity | undefined;
          for (const e of this.world.puppets.values()) {
            if (e.hp <= 0) continue;
            const d =
              abs(round(e.position.x - this._position.x)) +
              abs(round(e.position.z - this._position.z));
            if (d > max_distance) continue;
            max_distance = d;
            friend = e;
          }
          if (friend) {
            this.lf2.mt.mark = 'u_1'
            const x = this.lf2.mt.range(
              max(round(friend.position.x - 100), this.world.stage.player_l),
              min(round(friend.position.x + 100), this.world.stage.player_r)
            )
            this.lf2.mt.mark = 'u_2'
            const z = this.lf2.mt.range(
              min(round(friend.position.z - 100), this.world.stage.far),
              max(round(friend.position.z + 100), this.world.stage.near)
            )
            this.set_position(x, 550, z)
          } else {
            this.set_position_y(550)
          }
          this.enter_frame(Defines.NEXT_FRAME_AUTO)
        }
      }
    }
    for (const pair of this._opoints) {
      const [opoint, time] = pair
      if (time === opoint.interval) {
        this.apply_opoints([opoint])
        pair[1] = 0;
      } else {
        pair[1] = time + 1;
      }
    }
    this._state?.pre_update?.(this);
    if (this.wait > 0) {
      if (
        this.motionless <= 0 &&
        this.shaking <= 0 &&
        !this._catcher &&
        !this._bearer
      ) {
        this.wait = rf(this.wait - this._atom_time)
        if (this.wait < 0) this.wait = 0;
      }
    } else {
      let nf = this.get_next_frame(this.frame.next)?.which;
      if (nf) nf = { ...nf, judger: void 0 }
      else nf = { id: this.find_auto_frame().id }
      this.enter_frame(nf)
    }
    this.handle_gravity();
    this.update_velocity(this.frame);
    this._state?.update(this);
    this.update_position();

    if (this.motionless > 0) {
      this.motionless = rf(this.motionless - this._atom_time);
      if (this.motionless < 0) this.motionless = 0
    }
    if (this.shaking > 0) {
      this.shaking = rf(this.shaking - this._atom_time);
      if (this.shaking < 0) this.shaking = 0
    }
    if (this.update_catching()) return;
    if (this.update_caught()) return;
    const { next_frame, key_list } = this.ctrl.update();
    if (
      key_list === "dja" &&
      this.transforms &&
      this.transforms[1] === this._data.id &&
      this._position.y === this.ground_y
    ) {
      this.transfrom_to_another();
      this.ctrl.reset_key_list();
    } else if (next_frame) {
      this.enter_frame(next_frame);
    }

    if (!this.shaking && !this.motionless) {
      const { prev_ground_y, ground_y } = this;
      const on_ground = this._prev_position.y <= prev_ground_y;
      const just_land = (this.velocity.y < 0 || !on_ground) && this._position.y <= ground_y
      const itrs = this.itr;

      if (itrs?.length && this.velocity.y < 0) for (const itr of itrs) {
        if (!itr.on_hit_ground) continue;
        const { y = 0, h = 0 } = itr;
        if ((this._position.y + this.frame.centery - y - h) > ground_y)
          continue;
        this.enter_frame(itr.on_hit_ground);
      }

      if (this.frame.landable) {
        // 落地
        if (just_land) {
          this._position.y = this._prev_position.y = ground_y;
          this._temp_v.x = this._velocity.x
          this._temp_v.y = this._velocity.y
          this._temp_v.z = this._velocity.z
          this._velocity.y = 0;
          this._prev_velocity.y = 0;
          this._state?.on_landing?.(this, this._temp_v);

          this.play_sound(this._data.base.drop_sounds);
          if (this.throwinjury) {
            this.hp -= this.throwinjury;
            this.hp_r -= round(this.throwinjury * (1 - this.dataset('hp_recoverability')))
            this.throwinjury = 0;
          }
          if (this.fallinjury) {
            this.hp -= this.fallinjury;
            this.hp_r -= round(this.fallinjury * (1 - this.dataset('hp_recoverability')))
            this.fallinjury = 0;
          }
          this._landing_frame = this.frame
        } else if (this.velocity.y == 0 && on_ground && !float_equal(prev_ground_y, ground_y)) {
          this._position.y = ground_y;
          this._prev_position.y = ground_y;
        } else if (this._position.y < ground_y) {
          // TODO: allow spawn under ground?
          // this._position.y = ground_y;
          // this._prev_position.y = ground_y;
        }
        if (this._landing_frame !== this.frame) this._landing_frame = null
        this._prev_ground_y = ground_y;
      }

    }
    this._holding?.follow_bearer();
    this.collision_list.length = 0;
    this.collided_list.length = 0;
  }

  update_position(): void {
    /* → EntityPhysics.ts */
  }

  /**
   * hp意外归0时，应该去的地方
   * @returns
   */
  get_sudden_death_frame(): TNextFrame {
    return this._state?.get_sudden_death_frame?.(this) || Defines.NEXT_FRAME_AUTO
  }

  /**
   * 获取“被抓结束”帧
   *
   * 被抓后，抓人者的“抓取值”降至0时，视为“被抓结束”，
   * 此时被抓者跳去的帧即为“被抓结束”帧
   *
   * @returns 下帧信息
   */
  get_caught_end_frame(): INextFrame {
    if (this._position.y < this.ground_y) this._position.y = this.ground_y + 1;
    return this._state?.get_caught_end_frame?.(this) || Defines.NEXT_FRAME_AUTO
  }

  /**
   * 获取“被抓取消”帧
   *
   * 被抓后，抓人者的“抓取值”未降至0，且catcher的帧缺少cpoint时，视为“被抓取消”，
   * 此时跳去的帧即为“被抓结束”帧
   *
   * @returns 下帧信息
   */
  get_caught_cancel_frame(): INextFrame {
    if (this._position.y < this.ground_y) this._position.y = this.ground_y + 1;
    return Defines.NEXT_FRAME_AUTO;
  }

  update_caught(): boolean {
    const cer = this._catcher;
    if (!cer) return false;
    /** "对齐颗粒度" */
    this.follow_catcher();
    if (!cer._catch_time) {
      this._catcher = null;
      this.prev_cpoint_a = null;
      this.enter_frame(this.get_caught_end_frame());
      return true;
    }

    const frame_a = cer.frame;
    const { cpoint: cp_a } = frame_a;
    if (!cp_a) {
      this._catcher = null;
      this.prev_cpoint_a = null;
      this.set_velocity_y(3);
      this.enter_frame(this.get_caught_cancel_frame());
      return true;
    }

    if (this.prev_cpoint_a !== cp_a) {
      const { injury } = cp_a;
      if (injury) {
        const prev_hp = this.hp;
        this.hp -= injury;
        this.hp_r -= injury * (1 - this.dataset('hp_recoverability'))
        summary_mgr.apply_damage(cer, injury, this, prev_hp);
      }
      const shaking = cp_a.shaking
      if (typeof shaking === 'number')
        this.shaking = shaking;
      else if (injury)
        this.shaking = this.dataset('itr_shaking')
    }
    this.prev_cpoint_a = cp_a;

    const { throwvx: tx = 0, throwvy: ty = 0, throwvz: tz = 0, throwinjury: ti = 0 } = cp_a;
    if (ti > 0) this.throwinjury = ti;
    if (tx || ty || tz) {
      this.follow_catcher();
      this._catcher = null;
      this.prev_cpoint_a = null;
    }
    if (cp_a.vaction) {
      return this.enter_frame(cp_a.vaction) >= EnterFrameResult.Entered;
    };
    return false
  }
  drop_catching(): boolean {
    if (!this._catching) return false;
    if (this._catching._catcher === this)
      this._catching._catcher = null;
    this._catching = null;
    this.enter_frame(Defines.NEXT_FRAME_AUTO);
    return true;
  }
  update_catching(): boolean {
    if (!this._catching) return false;
    if (!this._catch_time) {
      this._catching = null;
      this.enter_frame(Defines.NEXT_FRAME_AUTO);
      return true;
    }
    const { cpoint: cpoint_a } = this.frame;
    if (cpoint_a?.decrease) {
      this._catch_time = clamp_add(
        this._catch_time, cpoint_a.decrease * this._atom_time,
        0,
        this.catch_time_max
      )
    }
    if (!cpoint_a) {
      this._catching = null;
      this._catch_time = this.catch_time_max;
      this.enter_frame(Defines.NEXT_FRAME_AUTO);
      return true;
    }

    const { throwvx, throwvy, throwvz, throwinjury } = cpoint_a;
    if (throwinjury !== void 0) {
      if (throwinjury > 0) {
        // TODO：丢出后，被丢的人落地后的受到的伤害
        // return;
      } else if (throwinjury === -1) {
        if (is_fighter(this) && is_fighter(this._catching)) {
          this.transfrom_to_another(this._catching._data);
          this.enter_frame(this.find_auto_frame())
          return true;
        }
      } else {
        this.enter_frame(GONE_FRAME_INFO);
        return true;
      }
    }
    if (throwvx || throwvy || throwvz) {
      this._catching = null;
      return false;
    }

    /** "对齐颗粒度" */
    this.follow_catcher();
    return false;
  }

  follow_catcher() {
    const a = this._catcher;
    const b = this;
    if (!a) return;
    const { centerx: afx, centery: afy, cpoint: ac, } = a.frame;
    if (!ac) return;
    const { throwvx: tx = 0, throwvy: ty = 0, throwvz: tz = 0 } = ac;
    const { centerx: bfx, centery: bfy, cpoint: bc } = this.frame;
    const { x: ax, y: ay, z: az } = a.position;
    const a_face = a.facing;
    const { x: acx = 0, y: acy = 0, z: acz = 0 } = ac
    if (tx || ty || tz) {
      const vx = tx * this.dataset('tvx_f') * a_face
      const vy = ty * this.dataset('tvy_f')
      const vz = tz * this.dataset('tvz_f') * (a.ctrl.UD || 0)
      this.set_velocity(vx, vy, vz)
      this.set_position(
        (2 * vx) + ax - a_face * (afx - acx),
        (2 * vy) + ay + afy - acy,
        (2 * vz) + az + acz,
      )
      return;
    }
    const b_face = b.facing;
    const { x: bcx = 0, y: bcy = 0, z: bcz = 0 } = bc || {}
    this.set_position(
      ax - a_face * (afx - acx) + b_face * (bfx - bcx),
      ay + afy - acy + bcy - bfy,
      az + acz - bcz,
    )

  }

  /**
   * 获取“抓人结束”帧
   *
   * 抓人后，“抓取值”降至0时，视为“抓人结束”，
   *
   * 此时跳去的帧即为“抓人结束”帧
   *
   * @returns 下帧信息
   */
  get_catching_end_frame(): INextFrame {
    return Defines.NEXT_FRAME_AUTO;
  }

  /**
   * 获取“抓人取消”帧
   *
   * 抓人后，“抓取值”未降至0，且任意一方的帧缺少cpoint时，视为“抓人取消”，
   *
   * 此时跳去的帧即为“抓人取消”帧
   *
   * @returns 下帧信息
   */
  get_catching_cancel_frame(): INextFrame { return Defines.NEXT_FRAME_AUTO; }
  transfrom_to_another(data?: IEntityData) {
    const datas = this.transforms = data ?
      [this._data.id, data.id] :
      this.transforms;
    if (!datas?.length) return;
    const curr_idx = datas.indexOf(this._data.id)
    const next_idx = (curr_idx + 1) % datas.length;
    const next_data_id = datas[next_idx]
    const next_data = this.lf2.datas.find_entity(next_data_id);
    if (!next_data) return;
    this.transform(next_data);
    if (next_idx === 0) {
      // TODO: 这个逻辑感觉怪怪的，后续可以改成直接在数据里写死变身后的帧
      let nf = this.get_next_frame({ id: "245" })?.frame
      if (!nf) nf = this.find_auto_frame();
      this.enter_frame(nf);
    }
    if (this.copies.size) {
      const gones: string[] = []
      for (const id of this.copies) {
        const copy = this.world.entity_map.get(id);
        if (!copy?.mounted) gones.push(id)
        else copy.transform(next_data)
      }
      for (const d of gones)
        this.copies.delete(d)
    }
  }

  start_catch(target: Entity, itr: IItrInfo) {
    if (itr.catchingact === void 0) {
      Ditto.warn(`[Entity::start_caught] cannot catch, catchingact got ${itr.catchingact}`);
      return;
    }
    this._catch_time = this.catch_time_max;
    this._catching = target;
    this.enter_frame(itr.catchingact);
  }

  start_caught(attacker: Entity, itr: IItrInfo) {
    if (itr.caughtact === void 0) {
      Ditto.warn(`[Entity::start_caught] cannot be caught, caughtact got ${itr.caughtact}`)
      return;
    }
    this._catcher = attacker;
    this.resting = 0;
    this.fall_value = this.fall_value_max;
    this.defend_value = this.defend_value_max;
    this.enter_frame(itr.caughtact);
  }

  spark_point(r0: IBounding, r1: IBounding) {
    const cross: IBounding = cross_bounding(r0, r1);
    const {
      left: l,
      right: r,
      top: t,
      bottom: b,
      near: n,
      far: f,
    } = cross
    this.lf2.mt.mark = 'sp_1'
    const x = this.lf2.mt.range(l, r);
    const y = 2 + (b + t) / 2//this.lf2.random_in(b, t);
    const z = max(f, n) + 2;
    return [x, y, z] as const;
  }

  dizzy_catch_test(target: Entity): boolean {
    return (
      is_fighter(this) &&
      is_fighter(target) && target.state === StateEnum.Tired &&
      ((this.velocity.x > 0 && target.position.x > this._position.x) ||
        (this.velocity.x < 0 && target.position.x < this._position.x))
    );
  }

  release(): void {
    if (!this._mounted) return;
    this._mounted = 0;
    this.world.del_entity(this);
    this.callbacks.emit("on_disposed")(this);
    this.callbacks.clear()
    this.reset(this.data, this._states);
  }

  /**
   * 开始闪烁,闪烁完成后移除自己
   *
   * @param {number} duration 闪烁持续帧数
   */
  blink_and_gone(duration: number) {
    this._blinking_duration = duration;
    this._after_blink = Builtin_FrameId.Gone;
  }
  blink_and_respawn(duration: number) {
    this._blinking_duration = duration;
    this._after_blink = Builtin_FrameId.Respawn;
  }

  /**
   * 开始隐身
   *
   * @param {number} duration 隐身持续帧数
   */
  invisibility(duration: number) {
    this._invisible_duration = duration;
  }


  get_flag(other: Entity): number {
    let ret = this.team === other.team ? HitFlag.Ally : HitFlag.Enemy;
    if (this.hp <= 0) ret |= HitFlag.Dead;
    return ret | this.type;
  }
  is_ally(other: Entity): boolean {
    return this.team === other.team;
  }

  follow_bearer() {
    const bearer = this.bearer;
    if (!bearer) return;
    if (this.hp <= 0 && this.bearer) {
      bearer.holding = null;
      this.bearer = null;
      return;
    }
    const {
      wpoint: wp_a = {} as Partial<IWpointInfo>,
      centerx: cx_a, centery: cy_a,
    } = bearer.frame;

    if (wp_a.kind === WpointKind.Drop) {
      bearer.drop_holding();
      this.lf2.mt.mark = 'dh_v'
      const vy = 3
      const vx = this.lf2.mt.range(-10, 10) / 10
      const vz = this.lf2.mt.range(-10, 10) / 20;
      this.set_velocity(vx, vy, vz)
      return;
    }

    if (wp_a.weaponact !== this.frame.id) {
      // 还原wpoint丢失的情况
      this.enter_frame_by_id(wp_a.weaponact, true);
    }

    const {
      wpoint: wp_b = {} as Partial<IWpointInfo>,
      centerx: cx_b, centery: cy_b,
    } = this.frame;

    const strength = this._data.base.strength || 1;
    const weight = this._data.base.weight || 1;
    let { dvx, dvy, dvz } = wp_a;
    const { x, y, z } = bearer.position;
    this.facing = bearer.facing;
    const { x: wa_x = 0, y: wa_y = 0, z: wa_z = 0 } = wp_a;
    const { x: wb_x = 0, y: wb_y = 0, z: wb_z = 0 } = wp_b

    if (wp_a.kind) {
      this.set_position(
        x + this.facing * (wa_x - cx_a + cx_b - wb_x),
        y + cy_a - wa_y - cy_b + wb_y,
        z + wa_z - wb_z,
      )
    } else { // 还原wpoint丢失的情况
      this.set_position(
        x + this.facing * (wa_x - cx_a),
        y + cy_a - wa_y,
        z + wa_z,
      )
    }

    if (dvx !== void 0 || dvy !== void 0 || dvz !== void 0) {
      dvx = dvx ? dvx * this.dataset('wvx_f') : 0
      dvy = dvy ? dvy * this.dataset('wvy_f') : 0
      dvz = dvz ? dvz * this.dataset('wvz_f') : 0
      const nf = this.find_align_frame(
        this.frame.id,
        this.data.indexes?.on_hands,
        this.data.indexes?.throwings
      )
      this.set_position(
        round(x + this.facing * (wa_x - cx_a)),
        round(y + cy_a - wa_y),
        round(z + wa_z),
      )
      this.enter_frame(nf);
      const vz = bearer.ctrl ? bearer.ctrl.UD * (dvz || 0) : 0;
      dvx = strength * dvx / weight;
      dvy = strength * dvy / weight;
      const vx = (dvx - abs(vz / 2)) * this.facing;
      this.set_velocity(vx, dvy, vz);
      bearer.holding = null;
      this.bearer = null;
      return;
    }

  }

  enter_frame_by_id(id: string | undefined, fallback = false): EnterFrameResult {
    this._next_frame_by_id.id = id;
    return this.enter_frame(this._next_frame_by_id, fallback);
  }

  enter_frame(which: TNextFrame, fallback = false): EnterFrameResult {
    if (this.frame.id === Builtin_FrameId.Gone)
      return EnterFrameResult.Gone;

    const result = this.get_next_frame(which);
    if (!result && fallback) {
      const frame = this.find_auto_frame()
      this.set_frame(frame);
      this.wait = this.handle_wait_flag(void 0, frame);
      return EnterFrameResult.Fallback;
    }
    if (!result) return EnterFrameResult.NotFound;

    const { frame, which: flags } = result;
    if (!this.world.infinity_mp) {
      const { mp, hp } = flags;
      if (mp) this.mp -= mp;
      if (hp) this.hp -= hp;
    }
    if (frame) {
      if (frame.sound) {
        let { x, y, z } = this._position;
        if (frame.state === StateEnum.Message) {
          let { centerx, width } = frame;
          let { current_cam_pos: { x: cam_x } } = this.world;
          let cam_r = cam_x + this.world.screen_w;
          const offset_x = this.facing === 1 ? centerx : width - centerx;
          cam_r -= width - offset_x
          cam_x += offset_x
          x = clamp(x, cam_x, cam_r)
        }
        this.lf2.sounds.play(frame.sound, x, y, z);
      }
      this.set_frame(frame);
    } else if (this.frame === EMPTY_FRAME_INFO || fallback) {
      this.set_frame(this.find_auto_frame());
    }

    if (flags.facing != void 0) this.facing = this.handle_facing_flag(flags.facing);
    if (frame) this.wait = this.handle_wait_flag(flags.wait, frame);
    if (flags.sounds?.length) this.play_sound(flags.sounds);
    if (flags.blink_time) this.blinking = flags.blink_time;
    return frame ? EnterFrameResult.Entered : EnterFrameResult.Fallback;
  }

  handle_wait_flag(wait: string | number | undefined, frame?: IFrameInfo): number {
    if (wait == void 0 && frame) return frame.wait + this.world.wait_offset;
    if (is_positive(wait)) return wait;
    if (wait === "i" || !frame) return this.wait;
    if (wait === "d") return max(0, frame.wait - this.frame.wait + this.wait);
    return frame.wait + this.world.wait_offset;
  }

  /**
   * 进入下一帧时，需要处理朝向
   *
   * @see {FacingFlag}
   * @param facing 目标朝向, 可参考FacingFlag
   * @param frame 帧
   * @returns 返回新的朝向
   */
  handle_facing_flag(facing: number | undefined): -1 | 1 {
    switch (facing) {
      case FacingFlag.Ctrl:
        return this.ctrl?.LR || this.facing;
      case FacingFlag.AntiCtrl:
        return this.ctrl?.LR
          ? turn_face(this.ctrl.LR)
          : this.facing;
      case FacingFlag.SameAsCatcher:
        return this._catcher?.facing || this.facing;
      case FacingFlag.OpposingCatcher:
        return turn_face(this._catcher?.facing) || this.facing;
      case FacingFlag.Backward:
        return turn_face(this.facing);
      case FacingFlag.Left:
      case FacingFlag.Right:
        return facing;
      case FacingFlag.VX: {
        const vx = this.velocity.x
        return vx > 0 ? 1 : vx < 0 ? -1 : this.facing
      }
      case FacingFlag.AntiVX: {
        const vx = this.velocity.x
        return vx > 0 ? -1 : vx < 0 ? 1 : this.facing
      }
      case FacingFlag.Trend: {
        const { LR } = this.ctrl;
        if (LR) return LR;
        const vx = this.velocity.x;
        return vx > 0 ? 1 : vx < 0 ? -1 : this.facing;
      }
      case FacingFlag.SameAsBearer:
        return this._bearer?.facing || this.facing;
      case FacingFlag.OpposingBearer:
        return turn_face(this._bearer?.facing) || this.facing;
    }
    return this.facing;
  }

  get_next_frame(which: TNextFrame): INextFrameResult | undefined {
    if (Array.isArray(which)) {
      const l = which.length;
      const remains: INextFrame[] = []
      for (let i = 0; i < l; ++i) {
        const nf: INextFrame | undefined = which[i];
        if (!nf) continue;
        if (!nf.judger) {
          remains.push(nf)
          continue;
        }
        const f = this.get_next_frame(nf);
        if (f) return f;
      }
      const next = this.lf2.mt.pick(remains)
      if (!next) return;
      return this.get_next_frame(next);
    }
    const id = which.id;
    const judger = which.judger;
    const use_hp = which.hp;
    const use_mp = which.mp;
    const { mp_mode } = which;
    if (judger && !judger.run(this)) {
      return void 0;
    }
    let frame: IFrameInfo | undefined;
    if (id) {
      this.lf2.mt.mark = 'gnf_1'
      frame = this.find_frame_by_id(this.lf2.mt.pick(id));
      if (!frame) return void 0;
    }
    if (!this.world.infinity_mp && frame) {
      if (this.frame.next === which) {
        // 用next 进入此动作，负数表示消耗，无视正数。若消耗完毕跳至按下防御键的指定跳转动作
        if (use_mp && this._mp < use_mp)
          return this.get_next_frame(frame.hit?.d ?? Defines.NEXT_FRAME_AUTO);
        if (use_hp && this._hp <= use_hp)
          return this.get_next_frame(frame.hit?.d ?? Defines.NEXT_FRAME_AUTO);
      } else {
        if (use_mp && this._mp < use_mp && mp_mode != 1) return void 0;
        if (use_hp && this._hp <= use_hp) return void 0;
      }
    }

    let w: INextFrame;
    if (is_str(which)) {
      w = { id: which };
    } else {
      w = which;
    }

    return { frame, which: w };
  }

  find_frame_by_id(id: string | undefined): IFrameInfo | undefined {
    const r = this._state?.find_frame_by_id?.(this, id);
    if (r) return r;

    switch (id) {
      case void 0:
      case Builtin_FrameId.None:
      case Builtin_FrameId.Self:
        return this.frame;
      case Builtin_FrameId.Auto:
        return this.find_auto_frame();
      case Builtin_FrameId.Gone:
        return GONE_FRAME_INFO;
    }
    if (!this._data.frames[id]) {
      console.warn(
        Entity.TAG + "::find_frame_by_id",
        "frame not find! id:",
        id,
      );
      return this.find_auto_frame();
    }
    return this._data.frames[id];
  }
  get_prev_frame() {
    return this._prev_frame;
  }
  set_velocity(
    x?: number | null,
    y?: number | null,
    z?: number | null,
  ) {
    if (is_f_num(x) || is_f_num(y) || is_f_num(z)) debugger;
    x = (x === null || x === void 0) ? this.velocity.x : x ? round_float(x) : x
    y = (y === null || y === void 0) ? this.velocity.y : y ? round_float(y) : y
    z = (z === null || z === void 0) ? this.velocity.z : z ? round_float(z) : z
    this.velocity.set(x, y, z);
    this._velocity.set(x, y, z);
    this._prev_velocity.set(x, y, z);
  }
  set_velocity_x(x: number) {
    if (is_f_num(x)) debugger;
    this._velocity.x = round_float(x)
  }
  set_velocity_y(y: number) {
    if (is_f_num(y)) debugger;
    this._velocity.y = round_float(y)
  }
  set_velocity_z(z: number) {
    if (is_f_num(z)) debugger;
    this._velocity.z = round_float(z)
  }
  set_position(x?: number | null, y?: number | null, z?: number | null) {
    if (is_f_num(x) || is_f_num(y) || is_f_num(z)) debugger;
    if (x !== null && x !== void 0) this._position.x = x ? round_float(x) : x
    if (y !== null && y !== void 0) this._position.y = y ? round_float(y) : y
    if (z !== null && z !== void 0) this._position.z = z ? round_float(z) : z
    this._ground_y = this.world.get_ground(this._position)
  }
  set_position_x(x: number) {
    if (is_f_num(x)) debugger;
    this._position.x = x ? round_float(x) : x
  }
  set_position_y(y: number) {
    if (is_f_num(y)) debugger;
    this._position.y = y ? round_float(y) : y
    this._ground_y = this.world.get_ground(this._position)
  }
  set_position_z(z: number) {
    if (is_f_num(z)) debugger;
    this._position.z = z ? round_float(z) : z;
    this._ground_y = this.world.get_ground(this._position)
  }
  transform(data: IEntityData) {
    if (!is_human_ctrl(this.ctrl))
      this.ctrl = this.lf2.factory.create_ctrl(data.id, this.ctrl.player_id, this);
    const prev = this._data;
    this._data = data;
    const { armor } = this._data.base
    if (armor) {
      this.armor = armor
      this.toughness = this.toughness_max = armor.toughness
    } else {
      this.armor = null;
      this.toughness =
        this.toughness_max =
        this.toughness_resting =
        this.toughness_resting_max = 0;
    }
    this.callbacks.emit("on_data_changed")(this._data, prev, this)
  }

  play_sound(sounds: string[] | undefined, pos: IPos = this._position) {
    if (!sounds?.length) return;
    this.lf2.mt.mark = 'ps_1'
    const sound = this.lf2.mt.pick(sounds);
    if (!sound) return;
    const { x, y, z } = pos;
    this.lf2.sounds.play(sound, x, y, z);
  }

  get_emitter(idx: number): Entity | undefined {
    const emittier_id = this.emitters[idx];
    if (!emittier_id) return;
    return this.world.entity_map.get(emittier_id);
  }

  get_v_rest(a_id: string): number {
    return this.vrests.get(a_id)?.rest || 0;
  }
  add_v_rest(c: Collision) {
    this.vrests.set(c.aid, c);
    if (c.itr.kind === ItrKind.Block) this.blockers.set(c.aid, c);
    if (c.itr.kind === ItrKind.SuperPunchMe) this.superpunchs.set(c.aid, c);
  }
  del_v_rest(a_id: string) {
    this.vrests.delete(a_id);
    this.blockers.delete(a_id);
    this.superpunchs.delete(a_id);
  }
  dataset<K extends keyof Partial<IWorldDataset>>(name: K): IWorldDataset[K] {
    return (
      this.frame?.[name] ??
      this.data.base?.[name] ??
      this.world.bg.data.dataset?.[name] ??
      this.world[name]
    )
  }
  itr_fall(itr: IItrInfo): number {
    return itr.fall ?? this.dataset('itr_fall')
  }

  to_snapshot(): IEntitySnapshot {

    const vrests: [string, string][] = []
    this.vrests.entries().forEach(([k, v]) => vrests.push([k, v.id]))

    const blockers: [string, string][] = []
    this.blockers.entries().forEach(([k, v]) => blockers.push([k, v.id]))

    const superpunchs: [string, string][] = []
    this.superpunchs.entries().forEach(([k, v]) => superpunchs.push([k, v.id]))
    const ret: IEntitySnapshot = {
      id: this.id,
      wait: this.wait,
      variant: this.variant,
      transforms: this.transforms ? [...this.transforms] : null,
      lifetime: this._lifetime,
      spawn_time: this._spawn_time,
      outline_color: this._outline_color,
      outline_alpha: this._outline_alpha,
      outline_width: this._outline_width,
      outline_enabled: this._outline_enabled,
      mix_color: this._mix_color,
      mix_strength: this._mix_strength,
      greyscale: this._greyscale,
      prev_position: { x: this._prev_position.x, y: this._prev_position.y, z: this._prev_position.z },
      position: { x: this._position.x, y: this._position.y, z: this._position.z },
      prev_velocity: { x: this._prev_velocity.x, y: this._prev_velocity.y, z: this._prev_velocity.z },
      velocity: { x: this._velocity.x, y: this._velocity.y, z: this._velocity.z },
      copies: Array.from(this.copies),
      vrests,
      blockers,
      superpunchs,
      emitters: [...this.emitters],
      data: this._data.id,
      reserve: this._reserve,
      mounted: this._mounted,
      ghosted: this._ghosted,
      landing_frame: this._landing_frame?.id,
      hp_r_tick: this._hp_r_tick.to_snapshot(),
      mp_r_tick: this._mp_r_tick.to_snapshot(),
      drink: this.drink?.to_snapshot() ?? null,
      fuse_bys: this.fuse_bys?.map(v => v.id),
      dismiss_time: this.dismiss_time,
      dismiss_data: this.dismiss_data?.id,
      stat_bar_type: this._stat_bar_type,
      resting: this._resting,
      resting_max: this._resting_max,
      toughness: this._toughness,
      toughness_max: this._toughness_max,
      toughness_resting: this._toughness_resting,
      toughness_resting_max: this._toughness_resting_max,
      fall_value: this._fall_value,
      fall_value_max: this._fall_value_max,
      fall_r_tick: this._fall_r_tick.to_snapshot(),
      fall_r_value: this._fall_r_value,
      defend_value: this._defend_value,
      defend_value_max: this._defend_value_max,
      defend_r_tick: this._defend_r_tick.to_snapshot(),
      defend_r_value: this._defend_r_value,
      healing: this._healing,
      defend_ratio: this._defend_ratio,
      fallinjury: this.fallinjury,
      throwinjury: this.throwinjury,
      facing: this.facing,
      frame: this.frame.id,
      prev_frame: this._prev_frame.id,
      catching: this._catching?.id,
      catcher: this._catcher?.id,
      aabb_x1: this.aabb_min_x,
      aabb_x2: this.aabb_max_x,
      name: this._name,
      team: this._team,
      mp: this._mp,
      mp_max: this._mp_max ?? null,
      hp: this._hp,
      hp_r: this._hp_r,
      hp_max: this._hp_max,
      bearer: this._bearer?.id ?? null,
      holding: this._holding?.id ?? null,
      arest: this._arest,
      motionless: this.motionless,
      shaking: this.shaking,
      catch_time: this._catch_time,
      catch_time_max: this._catch_time_max,
      invisible_duration: this._invisible_duration,
      invulnerable_duration: this._invulnerable_duration,
      blinking_duration: this._blinking_duration,
      after_blink: this._after_blink,
      key_role: this._key_role,
      name_visible: this._name_visible,
      wakeup_invuln: this._wakeup_invuln,
      dead_gone: this._dead_gone,
      ctrl_visible: this._ctrl_visible,
      jumping: { ...this.jumping },
    }
    return ret;
  }

  read_snapshot(s: IEntitySnapshot) {
  }
}

// ============================================================
// Prototype 挂载：将拆分到子模块的实现绑定到 Entity 类
// ============================================================
// -- Physics --
Object.defineProperty(Entity.prototype, "dvx", { get: EntityPhysics.get_dvx });
Object.defineProperty(Entity.prototype, "dvy", { get: EntityPhysics.get_dvy });
Object.defineProperty(Entity.prototype, "dvz", { get: EntityPhysics.get_dvz });
Entity.prototype.handle_gravity = EntityPhysics.handle_gravity;
Entity.prototype.update_velocity = EntityPhysics.update_velocity;
Entity.prototype.handle_ground_velocity_decay = EntityPhysics.handle_ground_velocity_decay;
Entity.prototype.handle_velocity_decay = EntityPhysics.handle_velocity_decay;
Entity.prototype.update_position = EntityPhysics.update_position;
// -- Spawn --
Entity.prototype.on_spawn = EntitySpawn.on_spawn;
Entity.prototype.get_opoint_speed_z = EntitySpawn.get_opoint_speed_z;
Entity.prototype.apply_opoints = EntitySpawn.apply_opoints;
Entity.prototype.spawn_entity = EntitySpawn.spawn_entity;
Entity.prototype.attach = EntitySpawn.attach;
// -- Recovery --
Entity.prototype.dismiss_fusion = EntityRecovery.dismiss_fusion;
Entity.prototype.find_align_frame = EntityRecovery.find_align_frame;
Entity.prototype.stat_recovering = EntityRecovery.stat_recovering;
Entity.prototype.drop_holding = EntityRecovery.drop_holding;
Entity.prototype.hp_recovering = EntityRecovery.hp_recovering;
Entity.prototype.mp_recovering = EntityRecovery.mp_recovering;
Entity.prototype.check_fusion_dismissing = EntityRecovery.check_fusion_dismissing;

const common_creator = (world: World, data: IEntityData, states?: States) => {
  let ret = world.lf2.factory.acquire_entity(data.type)
  if (!ret) ret = new Entity(world, data, states)
  else ret.reset(data, states)
  return ret
}
Factory.register_entity(EntityEnum.Ball, common_creator);
Factory.register_entity(EntityEnum.Weapon, common_creator);
Factory.register_entity(EntityEnum.Entity, common_creator);
Factory.register_entity(EntityEnum.Fighter, common_creator);