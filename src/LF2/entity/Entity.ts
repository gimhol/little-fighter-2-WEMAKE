import { Ground } from "../Ground";
import { IWorldDataset } from "../IWorldDataset";
import type { LF2 } from "../LF2";
import type { World } from "../World";
import { Callbacks, ICollision, new_id, new_team } from "../base";
import { sus_cases } from "../cases_instances";
import { BaseController } from "../controller/BaseController";
import { InvalidController } from "../controller/InvalidController";
import {
  Builtin_FrameId, BuiltIn_OID, Defines, EntityEnum, EntityGroup, FacingFlag,
  FrameBehavior, HitFlag, IBdyInfo, IBounding, ICpointInfo, IDeadJoin, IEntityData,
  IFrameInfo, IItrInfo, INextFrame, INextFrameResult, IOpointInfo, IPos,
  is_independent, ItrKind, IVector3, IWpointInfo, OpointKind, OpointMultiEnum,
  OpointSpreading, SpeedMode, StateEnum, TEntityEnum, TFace, TNextFrame
} from "../defines";
import { EMPTY_FRAME_INFO } from "../defines/EMPTY_FRAME_INFO";
import { GONE_FRAME_INFO } from "../defines/GONE_FRAME_INFO";
import { IArmorInfo } from "../defines/IArmorInfo";
import { SpeedCtrl } from "../defines/SpeedCtrl";
import { Ditto } from "../ditto";
import { closer_one } from "../helper/closer_one";
import { States } from "../state";
import { ENTITY_STATES } from "../state/ENTITY_STATES";
import { State_Base } from "../state/State_Base";
import { abs, clamp, find, float_equal, floor, intersection, max, min, round, round_float } from "../utils";
import { Times } from "../utils/Times";
import { cross_bounding } from "../utils/cross_bounding";
import { is_f_num, is_num, is_positive, is_str } from "../utils/type_check";
import { DrinkInfo } from "./DrinkInfo";
import { Factory, ICreator } from "./Factory";
import type IEntityCallbacks from "./IEntityCallbacks";
import { summary_mgr } from "./SummaryMgr";
import { calc_v } from "./calc_v";
import { turn_face } from "./face_helper";
import { is_fighter, is_human_ctrl } from "./type_check";
export class Entity {
  static readonly TAG: string = 'Entity';
  world!: World;

  protected readonly _position: IVector3 = new Ditto.Vector3(0, 0, 0);
  protected readonly _prev_position: IVector3 = new Ditto.Vector3(0, 0, 0);
  protected _spawn_time: number = 0;
  protected _outline_color: string | undefined = void 0;
  protected _game_time: number = -1; // 每次update前与world对齐
  get outline_color(): string | undefined {
    return this._outline_color ?? Defines.TeamInfoMap[this.team]?.outline_color
  };
  set outline_color(v: string | undefined) {
    this._outline_color = v;
  }
  get position(): Readonly<IVector3> { return this._position }
  get prev_position(): Readonly<IVector3> { return this._prev_position }

  /**
   * 影分身
   *
   * @memberof Entity
   */
  readonly copies = new Set<Entity>();

  /**
   * 最终速度向量
   * - 每次更新position前，通过velocities计算得出
   * - 直接修改速度向量将不会影响position的计算，
   * - 直接修改会影响到使用其他到velocity判断的逻辑，所以别直接改
   * @readonly
   * @type {IVector3}
   */
  protected readonly _velocity: IVector3 = new Ditto.Vector3(0, 0, 0);
  protected readonly _landing_velocity: IVector3 = new Ditto.Vector3(0, 0, 0);
  /**
   * 速度向量数组
   *
   * @readonly
   * @type {IVector3[]}
   */
  private readonly velocities: IVector3[] = [new Ditto.Vector3(0, 0, 0)];
  readonly v_rests = new Map<string, ICollision>();
  readonly blockers = new Map<string, ICollision>();
  readonly superpunchs = new Map<string, ICollision>();

  readonly victims = new Map<string, ICollision>();
  readonly callbacks = new Callbacks<IEntityCallbacks>()
  protected readonly _emitters: string[] = [];

  id!: string;
  wait!: number;
  readonly update_id = new Times(0, Number.MAX_SAFE_INTEGER);
  variant!: number;
  transform_datas!: [IEntityData, IEntityData] | null;
  protected _data!: IEntityData;
  protected _reserve!: number;
  protected _is_attach!: boolean;
  protected _is_incorporeity!: boolean;
  protected _landing_frame!: IFrameInfo | null;
  protected _hp_r_tick!: Times;
  protected _mp_r_tick!: Times;
  public drink!: DrinkInfo | null;
  public fuse_bys!: Entity[] | null;
  public dismiss_time!: number | null;
  public dismiss_data!: IEntityData | null;
  public has_stat_bar!: boolean;
  protected _resting!: number;
  protected _resting_max?: number; // fallback from world
  protected _toughness!: number;
  protected _toughness_max!: number;
  protected _toughness_resting!: number;
  protected _toughness_resting_max!: number;
  protected _fall_value!: number;
  protected _fall_value_max?: number;
  protected _fall_r_tick!: Times;
  protected _fall_r_value!: number;
  protected _defend_value!: number;
  protected _defend_value_max?: number; // fallback from world
  protected _defend_r_tick!: Times;
  protected _defend_r_value!: number;
  protected _healing!: number;
  protected _defend_ratio?: number; // fallback from world
  public throwinjury!: number | null;
  public facing!: TFace;
  public frame!: IFrameInfo;
  public next_frame!: Readonly<INextFrame> | null;
  protected _prev_frame!: IFrameInfo;
  protected _catching!: Entity | null;
  protected _catcher!: Entity | null;
  protected states!: States;

  /**
   * 实体名称
   *
   * @protected
   * @type {string}
   */
  protected _name!: string;

  /**
   * 所属队伍
   *
   * @protected
   * @type {string}
   */
  protected _team!: string;
  protected _mp!: number;
  protected _mp_max?: number;
  protected _hp!: number;
  protected _hp_r!: number;
  protected _hp_max?: number;
  protected _bearer!: Entity | null;
  protected _holding!: Entity | null;
  protected _emitter_opoint!: IOpointInfo | null;

  /** 当前角色 */
  public a_rest!: number;
  public motionless!: number;
  public shaking!: number;

  /**
   * 抓人剩余值
   *
   * 当抓住一个被击晕的人时，此值充满。
   */
  protected _catch_time!: number;
  protected _catch_time_max?: number;

  /**
   * 隐身计数，每帧-1
   *
   * @protected
   * @type {number}
   */
  protected _invisible_duration!: number;

  /**
   * 无敌时间计数，每帧-1
   *
   * @protected
   * @type {number}
   */
  protected _invulnerable_duration!: number;

  /**
   * 闪烁计数，每帧-1
   *
   * @protected
   * @type {number}
   */
  protected _blinking_duration!: number;

  /**
   * 闪烁完毕后下一动作
   *
   * @protected
   * @type {string | TNextFrame}
   */
  protected _after_blink!: string | TNextFrame | null;

  protected _state!: State_Base | null;
  protected _key_role!: boolean | null;
  protected _dead_gone!: boolean | null;
  protected _dead_join!: IDeadJoin | null;
  protected _ctrl!: BaseController;
  armor!: Readonly<IArmorInfo> | null;
  protected _opoints!: [IOpointInfo, number][];
  private prev_cpoint_a!: ICpointInfo | null;


  /**
   * 最近一次攻击信息
   *
   * @type {ICollision}
   * @memberof Entity
   */
  lastest_collision!: ICollision | null;

  /**
   * 最近一次被攻击信息
   *
   * @type {ICollision}
   * @memberof Entity
   */
  lastest_collided!: ICollision | null;

  /**
   * 当前tick碰撞信息
   *
   * - 会在update后置空
   *
   * @type {ICollision[]}
   * @memberof Entity
   */
  readonly collision_list: ICollision[] = [];

  /**
   * 当前tick被碰撞信息
   *
   * - 会在update后置空
   *
   * @type {ICollision[]}
   * @memberof Entity
   */
  readonly collided_list: ICollision[] = [];

  protected _chasing!: Entity | null;
  renderer: any;
  ground: Ground = Ground.Default;
  old_ground_y: number | null = null
  get ground_y(): number {
    const { x, y, z } = this._position;
    return this.ground.get_y(x, y, z)
  }

  get velocity(): Readonly<IVector3> { return this._velocity }
  get landing_velocity(): Readonly<IVector3> { return this._landing_velocity }
  get data(): IEntityData { return this._data };
  get group() { return this._data.base.group };
  get is_attach() { return this._is_attach }
  get is_incorporeity() { return this._is_incorporeity }
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
    this._fall_value = v;
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
    this._defend_value = v;
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

  get catching() {
    return this._catching;
  }
  get catcher() {
    return this._catcher;
  }
  get lf2(): LF2 {
    return this.world.lf2;
  }
  get velocity_0(): Readonly<IVector3> {
    if (this.velocities.length > 0) return this.velocities[0];
    return this.velocities[0] = new Ditto.Vector3(0, 0, 0);
  }
  get velocity_1(): Readonly<IVector3> {
    if (this.velocities.length > 1) return this.velocities[1];
    return this.velocities[1] = new Ditto.Vector3(0, 0, 0);
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
    return this._name;
  }

  set name(v: string) {
    if (v === this._name) return;
    const o = this._name;
    this.callbacks.emit("on_name_changed")(this, (this._name = v), o);
  }

  get mp(): number {
    return this._mp;
  }
  set mp(v: number) {
    const o = this._mp;
    v = max(0, v)
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
    if (o === v) return;
    this.callbacks.emit("on_hp_r_changed")(this, (this._hp_r = v), o);
  }

  get hp(): number {
    return this._hp;
  }
  set hp(v: number) {
    const o = this._hp;
    v = max(0, v)
    if (o === v) return;
    this._hp = v;
    if (v < o) summary_mgr.get(this.id).hp_lost += o - v;
    if (v < o && !is_independent(this.team)) summary_mgr.get(this.team).hp_lost += o - v;

    this.callbacks.emit("on_hp_changed")(this, v, o);
    if (o > 0 && v <= 0) {
      this.world.del_chaser(this);
      this.callbacks.emit("on_dead")(this);
      this.state?.on_dead?.(this);
      if (this._data.base.brokens?.length) {
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
    if (v === o) return;
    this.callbacks.emit("on_mp_max_changed")(this, (this._mp_max = v), o);
  }

  get hp_max(): number {
    return this._hp_max ?? this.world.hp_max;
  }
  set hp_max(v: number) {
    const o = this.hp_max;
    v = max(0, v)
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
  }

  get src_emitter(): Entity | undefined { return this.get_emitter(0) }
  get pre_emitter(): Entity | undefined { return this.get_emitter(this.emitters.length - 1) }
  get emitters(): string[] { return this._emitters; }

  set state(v: State_Base | null | undefined) {
    if (this._state === v) return;
    this._state?.leave?.(this, this.frame);
    this._state = v || null;
    this._state?.enter?.(this, this.get_prev_frame());
  }

  get state(): State_Base | null {
    return this._state;
  }

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
    prev.dispose();
  }
  get key_role(): boolean {
    if (this._key_role !== null) return this._key_role;
    const is_player = !!this.ctrl?.player_id;
    const is_key = !!intersection(this._data.base.group, [EntityGroup.Regular, EntityGroup.Boss]).length
    return this._key_role = is_player || is_key;
  }
  set key_role(v: boolean | null) {
    if (this._key_role === v) return;
    this._key_role = v;
    this.callbacks.emit("on_name_changed")(this, this._name, this._name);
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

  get chasing(): Entity | null { return this._chasing; }
  set chasing(e: Entity | null) { this._chasing = e || null; }
  get spawn_time() { return this._spawn_time }

  get gravity(): number {
    return this.frame.gravity ?? this.state?.get_gravity(this) ?? this.world.gravity
  }

  constructor(world: World, data: IEntityData, states: States = ENTITY_STATES) {
    this.reset(world, data, states)
  }

  reset(world: World, d: IEntityData, states: States = ENTITY_STATES) {
    this._data = d;
    this.world = world;
    this.ground = Ground.Default;
    this.id = new_id();
    this.wait = 0;
    this.update_id.reset()
    this.old_ground_y = null;
    this.variant = 0;
    this.transform_datas = null;
    this._reserve = 0
    this._is_attach = false;
    this._is_incorporeity = false;
    this._position.set(0, 0, 0)
    this._prev_position.set(0, 0, 0)
    this.fuse_bys = null;
    this.dismiss_time = null;
    this.dismiss_data = null;
    this.copies.clear()
    this.has_stat_bar = false;
    this._game_time = -1;
    this._toughness_resting_max = Defines.DEFAULT_TOUGHNESS_RESTING_MAX;
    this._resting_max = d.base.resting;
    this._resting = 0;
    this._toughness = 0;
    this._toughness_max = 0;
    this._toughness_resting = 0;
    this._fall_value_max = d.base.fall_value;
    this._defend_value_max = d.base.defend_value;
    this._defend_ratio = d.base.defend_ratio;
    this._healing = 0;
    this._catch_time_max = d.base.catch_time;
    this.throwinjury = null;
    this.facing = 1;
    this.frame = EMPTY_FRAME_INFO;
    this.next_frame = null;
    this._prev_frame = EMPTY_FRAME_INFO;
    this._catching = null
    this._catcher = null
    this._velocity.set(0, 0, 0)
    this._landing_velocity.set(0, 0, 0)
    this.velocities.length = 0;
    this.velocities[0] = new Ditto.Vector3(0, 0, 0)
    this.callbacks.clear();
    this._name = ""
    this._team = new_team();
    this._landing_frame = null;
    this._bearer = null;
    this._holding = null;
    this._emitters.length = 0;
    this._emitter_opoint = null;
    this.next_frame = null;
    this.a_rest = 0;
    this.v_rests.clear()
    this.blockers.clear()
    this.superpunchs.clear()
    this.victims.clear()
    this.motionless = 0;
    this.shaking = 0;
    this.states = states;
    this._hp_r_tick = new Times(0, world.hp_r_ticks);
    this._mp_r_tick = new Times(0, world.mp_r_ticks);
    this._fall_r_tick = new Times(0, world.fall_r_ticks);
    this._defend_r_tick = new Times(0, world.defend_r_ticks);
    this._defend_r_value = world.defend_r_value;
    this._fall_r_value = world.fall_r_value;
    this._hp_max = d.base.hp;
    this._ctrl = new InvalidController("", this);
    this._mp_max = d.base.mp;
    this._defend_ratio = d.base.defend_ratio

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

    this.drink = d.base.drink ? new DrinkInfo(d.base.drink) : null
    this._opoints = [];
    this.prev_cpoint_a = null;
    this._chasing = null;
    this.collision_list.length = 0;
    this.collided_list.length = 0;
    this.lastest_collision = null;
    this.lastest_collided = null;
    this._outline_color = void 0;
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
      this.state?.get_auto_frame?.(this) ?? this._data.frames["0"] ?? this.frame
    ); // FIXME: fix this 'as'.
  }

  on_spawn(
    emitter: Entity,
    opoint: IOpointInfo,
    offset_velocity: IVector3 = new Ditto.Vector3(0, 0, 0),
    facing: TFace = emitter.facing,
  ) {
    this._emitter_opoint = opoint;
    const emitter_frame = emitter.frame;
    if (emitter.frame.state === StateEnum.Ball_Rebounding) {
      const attacker = emitter.lastest_collided?.attacker ?? emitter;
      this._emitters[0] = attacker.id;
      this._emitters.length = 1
      this.team = attacker.team;
      this.facing = emitter.facing;
    } else {
      this._emitters.push(emitter.id);
      this.team = emitter.team;
      this.facing = emitter.facing;
    }
    const { origin_type } = opoint
    let { x: pos_x, y: pos_y, z: pos_z } = emitter.position;
    if (origin_type === 1) {
      pos_y = pos_y - opoint.y;
      pos_x = pos_x + emitter.facing * opoint.x;
    } else {
      pos_y = pos_y + emitter_frame.centery - opoint.y;
      pos_x = pos_x - emitter.facing * (emitter_frame.centerx - opoint.x);
    }
    this.set_position(
      pos_x,
      pos_y,
      pos_z + (opoint.z ?? 0)
    );

    const result = this.get_next_frame(opoint.action);
    facing = result?.which.facing
      ? this.handle_facing_flag(result.which.facing)
      : emitter.facing;

    if (result) this.enter_frame(result.which);
    else this.enter_frame(this.find_auto_frame())
    let {
      dvx: o_dvx = 0,
      dvy: o_dvy = 0,
      dvz: o_dvz = 0,
      speedz: o_speedz = this.get_opoint_speed_z(emitter, opoint)
    } = opoint;

    const weight = this._data.base.weight || 1
    o_dvy = round_float(o_dvy / weight);
    const ud = emitter.ctrl?.UD || 0;
    const { x: ovx, y: ovy, z: ovz } = offset_velocity;
    if (o_dvx > 0) {
      o_dvx = round_float(o_dvx / weight - abs(ovz / 2));
    } else {
      o_dvx = round_float(o_dvx / weight + abs(ovz / 2));
    }

    if (is_num(opoint.max_hp)) this.hp = this.hp_r = this.hp_max = opoint.max_hp;
    if (is_num(opoint.hp)) this.hp = this.hp_r = opoint.hp;
    if (is_num(opoint.max_mp)) this.mp = this.mp_max = opoint.max_mp;
    if (is_num(opoint.mp)) this.mp = opoint.mp;

    const { dvy = 0, dvz = 0 } = this.frame
    const z_disabled =
      result?.frame?.state === StateEnum.Normal ||
      result?.frame?.state === StateEnum.Burning

    const vx = round_float(ovx + o_dvx * facing)
    const vy = round_float(ovy + o_dvy + dvy)
    const vz = z_disabled ? 0 : round_float(ovz + o_dvz + o_speedz * ud + dvz)
    this.set_velocity(vx, vy, vz)
    if (sus_cases.debugging) {
      sus_cases.push('on_spawn::pos', pos_x, pos_y, pos_z)
      sus_cases.push('on_spawn::vec1', vx, vy, vz)
    }

    switch (opoint.kind) {
      case OpointKind.Pick:
        emitter.drop_holding()
        this.bearer = emitter;
        this.bearer.holding = this;
        break;
    }
    return this;
  }

  get_opoint_speed_z(emitter: Entity, opoint: IOpointInfo): number {
    if (opoint.speedz !== void 0) return opoint.speedz;
    if (!is_fighter(emitter)) return 0;
    switch (this._data.id) {
      case BuiltIn_OID.FirenFlame:
        return Defines.DEFAULT_FIREN_FLAME_SPEED_Z;
      case BuiltIn_OID.HenryWind:
      case BuiltIn_OID.FirzenBall:
      case BuiltIn_OID.Bat:
      case BuiltIn_OID.BatChase:
      case BuiltIn_OID.BatBall:
      case BuiltIn_OID.JanChase:
      case BuiltIn_OID.JanChaseh:
        opoint.speedz = 0;
        break;
    }
    switch (this.frame.state) {
      case StateEnum.Ball_Flying:
      case StateEnum.Ball_3006:
      case StateEnum.Weapon_Throwing:
      case StateEnum.HeavyWeapon_InTheSky:
        return Defines.DEFAULT_OPOINT_SPEED_Z;
    }
    return 0;
  }

  set_state(state_code: number) {
    const next_state = this.states.get(state_code) || this.states.fallback(this._data.type, state_code);
    this.state = next_state;
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
    const prev_state_code = this._prev_frame.state;
    const next_state_code = this.frame.state;
    if (prev_state_code !== next_state_code) {
      this.set_state(next_state_code)
    }
    if (this._prev_frame !== this.frame) {
      this.state?.on_frame_changed?.(this, this.frame, this._prev_frame);

      if (this.hp > 0) {
        const pre_chase = this._prev_frame.chase?.flag;
        const cur_chase = this.frame.chase?.flag;
        if (pre_chase && !cur_chase)
          this.world.del_chaser(this)
        else if (cur_chase && pre_chase != cur_chase)
          this.world.add_chaser(this, cur_chase)
      }
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

  apply_opoints(opoints: IOpointInfo[]) {
    for (let opoint of opoints) {
      const { interval = 0, interval_id, interval_mode } = opoint;
      const interval_info = this._opoints.find(v => v[0].interval_id === interval_id)
      if (interval_info && interval_mode === 1) {
        if (interval_info[1] !== opoint.interval) continue;
      } else if (interval > 0) {
        this._opoints.push([opoint, 0])
      }
      let enemies: Entity[] = []
      let allies: Entity[] = []
      let multi_type: OpointMultiEnum | undefined = void 0
      let count = 0;
      const multi = opoint.multi ?? 1;
      if (is_num(multi)) {
        count = multi;
      } else if (multi) {
        const {
          type, min = 0, max = 355,
          // TODO: 改用skip_zero来表达
          skip_zero = opoint.spreading === OpointSpreading.FirzenDisater
        } = multi
        switch (multi_type = type) {
          case OpointMultiEnum.AccordingEnemies:
            enemies = this.world.list_enemy_fighters(this, o => o.hp > 0)
            if (skip_zero && !enemies.length) break;
            count = clamp(enemies.length, min, max);
            break;
          case OpointMultiEnum.AccordingAllies:
            allies = this.world.list_ally_fighters(this, o => o.hp > 0)
            if (skip_zero && !allies.length) break;
            count = clamp(allies.length, min, max);
            break;
        }
      }
      let facing = this.facing;
      for (let i = 0; i < count; ++i) {
        const v = new Ditto.Vector3(0, 0, 0);
        switch (opoint.spreading) {
          case void 0:
          case OpointSpreading.Normal:
            v.z = (i - (count - 1) / 2) * 2.5;
            break;
          case OpointSpreading.Bat:
            v.x = this.lf2.bat_spreading_x.take()
            v.z = this.lf2.bat_spreading_z.take()
            facing = v.x < 0 ? -1 : v.x > 0 ? 1 : facing
            break;
          case OpointSpreading.FirzenDisater:
            v.x = this.lf2.disater_spreading_x.take()
            v.y = this.lf2.disater_spreading_y.take()
            facing = v.x < 0 ? -1 : v.x > 0 ? 1 : facing
            break;
          case OpointSpreading.JanDevilJudgement:
            v.x = this.lf2.jan_devil_judgement_spreading_x.take()
            v.y = this.lf2.jan_devil_judgement_spreading_y.take()
            facing = v.x < 0 ? -1 : v.x > 0 ? 1 : facing
            break;
        }
        const e = this.spawn_entity(opoint, v, facing);
        if (e) switch (this.frame.behavior) {
          case FrameBehavior.JulianBallStart:
            e.merge_velocities();
            const { x } = e.velocity;
            this.lf2.mt.mark = 'ao_1'
            const zz = round_float(this.lf2.mt.range(-5, 5) / 5)
            this.lf2.mt.mark = 'ao_2'
            const yy = round_float(this.lf2.mt.range(-5, 5) / 10)
            e.set_velocity(x, yy, zz)
            break;
          case FrameBehavior.FirzenDisasterStart:
          case FrameBehavior.FirzenVolcanoStart:
          case FrameBehavior.BatStart:
          case FrameBehavior.DevilJudgementStart:
            if (multi_type === OpointMultiEnum.AccordingEnemies) {
              e.chasing = enemies[i % enemies.length]
              if (e.chasing) {
                e.facing = (e.chasing.position.x > e.position.x) ? 1 : -1
                e.set_velocity_x(e.facing * abs(e.velocity.x))
              }
            }
            break;
          case FrameBehavior.AngelBlessingStart:
            if (multi_type === OpointMultiEnum.AccordingAllies)
              e.chasing = allies[i % allies.length]
            break;
        }
      }

    }
  }

  spawn_entity(
    opoint: IOpointInfo,
    offset_velocity: IVector3 = new Ditto.Vector3(0, 0, 0),
    facing: TFace = this.facing
  ): Entity | undefined {
    this.lf2.mt.mark = 'se_1'
    const oid = this.lf2.mt.pick(opoint.oid);
    if (!oid) {
      Ditto.warn(`[${Entity.TAG}::spawn_object] failed, oid: ${oid}, opoint: `, opoint);
      return;
    }
    const data = this.world.lf2.datas.find(oid);
    if (!data) {
      Ditto.warn(`[${Entity.TAG}::spawn_object] failed, oid: ${oid}, data: `, data, ` opoint: `, opoint);
      debugger
      return;
    }
    const entity = Factory.inst.create_entity(data.type, this.world, data);
    if (!entity) {
      Ditto.warn(`[${Entity.TAG}::spawn_object] failed, oid: ${oid}, data: `, data, ` opoint: `, opoint);
      debugger
      return;
    }
    entity.ctrl = Factory.inst.create_ctrl(entity._data.id, "", entity,) ?? entity.ctrl;
    entity.on_spawn(this, opoint, offset_velocity, facing).attach(opoint.is_entity);
    if (entity.data.id === this.data.id) this.copies.add(entity)
    entity.key_role = false;
    entity.dead_gone = true;
    /* Note: 继承v_rests，避免重复反弹ball... */
    for (const [, v] of this.v_rests) entity.add_v_rest({ ...v })
    return entity;
  }

  attach(is_entity = true): this {
    this._spawn_time = this.world.game_time.value;
    this._is_attach = true
    this._is_incorporeity = !is_entity
    if (is_entity)
      this.world.add_entities(this);
    else
      this.world.add_ghosts(this);
    if (EMPTY_FRAME_INFO === this.frame)
      this.enter_frame(Defines.NEXT_FRAME_AUTO);
    return this;
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
  handle_ground_velocity_decay(factor: number = 1) {
    if (this._position.y > this.ground_y || this.shaking || this.motionless) return;
    const landing = this._landing_frame === this.frame;
    factor *= landing ? this.world_dataset('land_friction_factor') : this.world_dataset('friction_factor')
    const fx = landing ? this.world_dataset('land_friction_x') : this.world_dataset('friction_x')
    const fz = landing ? this.world_dataset('land_friction_z') : this.world_dataset('friction_z')
    this.handle_velocity_decay(fx, fz, factor)
  }

  handle_velocity_decay(fx: number, fz: number = fx, factor: number = 1) {
    let { x, z } = this.velocities[0];
    if (factor != void 0) {
      x *= factor;
      z *= factor;
    }
    if (x > 0) {
      x -= fx;
      if (x < 0) x = 0; // 不能因为摩擦力反向加速
    } else if (x < 0) {
      x += fx;
      if (x > 0) x = 0; // 不能因为摩擦力反向加速
    }
    if (z > 0) {
      z -= fz;
      if (z < 0) z = 0; // 不能因为摩擦力反向加速
    } else if (z < 0) {
      z += fz;
      if (z > 0) z = 0; // 不能因为摩擦力反向加速
    }
    this.set_velocity_0_x(x)
    this.set_velocity_0_z(z);
  }

  /**
   * 实体响应重力
   *
   * 本质就是增加y轴方向向下的速度，
   * 有`velocity.y -= State_Base.get_gravity() ?? World.gravity`
   *
   * 以下情况不响应重力:
   * 
   * - 被持有，或被抓
   * 
   * - 实体处于地面或地面以下（position.y <= ground_y）
   *
   * - 角色处于shaking中（即实体被某物击中, see IItrInfo.shaking）
   *
   * - 角色处于motionless中，（即实体击中某物时, see IItrInfo.motionless）
   *
   * @see {IItrInfo.shaking}
   * @see {IItrInfo.motionless}
   * @see {State_Base.get_gravity}
   * @see {World.gravity}
   */
  private handle_gravity() {
    if (this.bearer || this.catcher || this.shaking || this.motionless) return;
    const { gravity_enabled = true } = this.frame;
    if (this._position.y <= this.ground_y || this.shaking || this.motionless || !gravity_enabled) return;
    this.velocities[0].y -= this.gravity;
  }

  private update_velocity() {
    if (this.bearer || this.catcher || this.shaking || this.motionless) return;
    const {
      dvx,
      dvy,
      dvz,
      vxm = SpeedMode.LF2,
      vym = SpeedMode.AccTo,
      vzm = SpeedMode.LF2,
      acc_x = (vxm == SpeedMode.AccTo) ? dvx : void 0,
      acc_y = (vym == SpeedMode.AccTo) ? dvy : void 0,
      acc_z = (vzm == SpeedMode.AccTo) ? dvz : void 0,
      ctrl_x = 0,
      ctrl_y = 0,
      ctrl_z = 0,
    } = this.frame;
    let { x: vx, y: vy, z: vz } = this.velocities[0];
    const { UD, LR, jd } = this._ctrl;

    if (dvx == void 0) { }
    else if (!ctrl_x) vx = calc_v(vx, dvx * this.world.fvx_f, vxm, acc_x, this.facing);
    else if (LR != 0 && SpeedCtrl.Control == ctrl_x) vx = calc_v(vx, dvx * this.world.fvx_f, vxm, acc_x, LR);
    else if (LR != 0 && SpeedCtrl.Enable == ctrl_x) vx = calc_v(vx, dvx * this.world.fvx_f, vxm, acc_x, 1);
    else if (LR == 0 && SpeedCtrl.Disable == ctrl_x) vx = calc_v(vx, dvx * this.world.fvx_f, vxm, acc_x, 1);

    if (dvy == void 0) { }
    else if (!ctrl_y) vy = calc_v(vy, dvy * this.world.fvy_f, vym, acc_y, 1);
    else if (jd != 0 && SpeedCtrl.Control == ctrl_y) vy = calc_v(vy, dvy * this.world.fvy_f, vym, acc_y, jd);
    else if (jd != 0 && SpeedCtrl.Enable == ctrl_y) vy = calc_v(vy, dvy * this.world.fvy_f, vym, acc_y, 1);
    else if (jd == 0 && SpeedCtrl.Disable == ctrl_y) vy = calc_v(vy, dvy * this.world.fvy_f, vym, acc_y, 1);

    if (dvz == void 0) { }
    else if (!ctrl_z) vz = calc_v(vz, dvz * this.world.fvz_f, vzm, acc_z, 1);
    else if (UD != 0 && SpeedCtrl.Control == ctrl_z) vz = calc_v(vz, dvz * this.world.fvz_f, vzm, acc_z, UD);
    else if (UD != 0 && SpeedCtrl.Enable == ctrl_z) vz = calc_v(vz, dvz * this.world.fvz_f, vzm, acc_z, 1);
    else if (UD == 0 && SpeedCtrl.Disable == ctrl_z) vz = calc_v(vz, dvz * this.world.fvz_f, vzm, acc_z, 1);

    this.set_velocity_0(vx, vy, vz);
    if (vxm == SpeedMode.Extra && dvx) this.set_velocity_1_x(dvx)
    if (vym == SpeedMode.Extra && dvy) this.set_velocity_1_y(dvy)
    if (vzm == SpeedMode.Extra && dvz) this.set_velocity_1_z(dvz)
    if (vxm == SpeedMode.Fixed) this.set_velocity_1_x(0)
    if (vym == SpeedMode.Fixed) this.set_velocity_1_y(0)
    if (vzm == SpeedMode.Fixed) this.set_velocity_1_z(0)
  }

  dismiss_fusion(frame_id: string) {
    if (!this.fuse_bys?.length) return;
    const size = this.fuse_bys.length + 1
    const hp = round(this.hp / size)
    const hp_r = round(this.hp_r / size)
    const mp = round(this.mp / size)
    let facing = this.facing
    this.hp = hp
    this.mp = mp
    this.hp_r = hp_r
    for (const fighter of this.fuse_bys) {
      fighter.hp = hp
      fighter.mp = mp
      fighter.hp_r = hp_r
      fighter.facing = facing = turn_face(facing)
      fighter.next_frame =
        fighter.get_next_frame({ id: frame_id })?.frame ??
        fighter.find_auto_frame()
      fighter.invisible =
        fighter.motionless =
        fighter.invulnerable = 0;
    }
    if (this.dismiss_data)
      this.transform(this.dismiss_data)
    this.next_frame =
      this.get_next_frame({ id: frame_id })?.frame ??
      this.find_auto_frame()
    this.dismiss_time = null;
    this.dismiss_data = null;
    this.fuse_bys = null
  }

  find_align_frame(
    frame_id: string,
    src: string[] | undefined | null,
    dst: string[] | undefined | null
  ): INextFrame {
    if (dst?.length && src?.length) {
      const src_idx = src.indexOf(frame_id)
      const dst_idx = (src_idx + 1) % dst.length;
      return { id: dst[dst_idx] };
    } else if (dst?.length) {
      return { id: dst[0] };
    } else {
      return this.find_auto_frame()
    }
  }

  /**
   * 状态恢复
   *
   * @memberof Entity
   */
  stat_recovering(): void {
    if (this.resting > 0) { this.resting--; return; }
    if (this.toughness_resting > 0) this.toughness_resting--;
    else if (this.toughness < this.toughness_max) this.toughness += 1;
    if (this.fall_value < this.fall_value_max && this._fall_r_tick.add())
      this.fall_value += this._fall_r_value;
    if (this.defend_value < this.defend_value_max && this._defend_r_tick.add())
      this.defend_value += this._defend_r_value;
  }

  /**
   * 持有物脱手
   *
   * @return {undefined}
   * @memberof Entity
   */
  drop_holding(): void {
    if (!this.holding) return;
    this.holding.follow_bearer();
    this.lf2.mt.mark = 'dh_1'
    this.holding.enter_frame({ id: this.lf2.mt.pick(this.holding.data.indexes?.in_the_skys) });
    this.holding.bearer = null;
    this.holding = null;
  }

  /**
   * 回血
   *
   * @memberof Entity
   */
  hp_recovering(): void {
    if (this._hp <= 0 || this._hp >= this._hp_r)
      return;
    const { base } = this._data
    this._hp_r_tick.max = this.healing > 0 ?
      (base.hp_healing_ticks ?? this.world.hp_healing_ticks) :
      (base.hp_r_ticks ?? this.world.hp_r_ticks);

    if (!this._hp_r_tick.add())
      return;
    const value = this.healing > 0 ?
      (base.hp_healing_value ?? this.world.hp_healing_value) :
      (base.hp_r_value ?? this.world.hp_r_value);
    this.hp = min(this._hp_r, this._hp + value);
    if (this._hp === this._hp_r) this.healing = 0;
    else if (this._healing) this.healing = max(0, this._healing - value)
  }

  /**
   * 回蓝
   *
   * @memberof Entity
   */
  mp_recovering(): void {
    if (this._hp <= 0 || this._mp >= this.mp_max || this._blinking_duration || this._invisible_duration)
      return;
    const { base } = this._data
    this._mp_r_tick.max = base.mp_r_ticks ?? this.world.mp_r_ticks;
    if (!this._mp_r_tick.add())
      return;
    const r_ratio = base.mp_r_ratio ?? this.world.mp_r_ratio;
    const value = 1 + floor(round_float((500 - min(r_ratio * this._hp, 500)) / 100))
    this.mp = min(this.mp_max, this._mp + value);
  }

  /**
   * 检查是否应该解除合体
   *
   * @return {boolean} 解除合体时返回true，否则返回false
   * @memberof Entity
   */
  check_fusion_dismissing(): boolean {
    if (!this.fuse_bys?.length) return false;

    const { x, y, z } = this._position
    for (const fighter of this.fuse_bys) {
      fighter.position.set(x, y, z)
    }
    if (this.dismiss_time) this.dismiss_time--;

    const should_dismiss = (
      this.dismiss_time !== null &&
      this.dismiss_time <= 0 ||
      this.ctrl.sametime_keys_test('dja') ||
      this.ctrl.sequence_keys_test('ja')
    ) && y == 0;
    if (should_dismiss)
      this.dismiss_fusion("112")
    return should_dismiss;
  }

  update(): void {
    this._game_time = this.world.game_time.value;
    this.update_id.add()
    if (this.next_frame) this.enter_frame(this.next_frame);
    if (this.frame.facing) this.facing = this.handle_facing_flag(this.frame.facing)
    if (this.check_fusion_dismissing()) return;
    this.hp_recovering()
    this.mp_recovering();

    if (this.frame.hp) this.hp -= this.frame.hp;

    if (this.shaking <= 0 || 0 == this.world_dataset('vrest_after_shaking'))
      for (const [k, v] of this.v_rests) {
        if (v.rest > 0) --v.rest;
        else this.del_v_rest(k)
      }
    for (const [k, v] of this.victims)
      if (v.rest) this.victims.delete(k)

    if (0 == this.world_dataset('arest_after_motionless') || this.motionless <= 0)
      this.a_rest > 0 ? this.a_rest-- : (this.a_rest = 0);

    if (this._invisible_duration > 0) {
      this._invisible_duration--;
      if (this._invisible_duration <= 0) {
        this._blinking_duration = this.world_dataset('invisible_blinking');
      }
    }
    if (this._invulnerable_duration > 0) {
      this._invulnerable_duration--;
    }
    if (this._blinking_duration > 0) {
      this._blinking_duration--;
      if (this._blinking_duration <= 0) {
        if (this._after_blink === Builtin_FrameId.Gone) {
          this.next_frame = null;
          this.frame = GONE_FRAME_INFO;
        } else if (this._after_blink === Builtin_FrameId.Respawn) {
          this.hp = this.hp_r = this.hp_max;
          this._position.y = 550;

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
            this._position.x = this.lf2.mt.range(
              max(round(friend.position.x - 100), this.world.stage.player_l),
              min(round(friend.position.x + 100), this.world.stage.player_r)
            )
            this.lf2.mt.mark = 'u_2'
            this._position.z = this.lf2.mt.range(
              min(round(friend.position.z - 100), this.world.stage.far),
              max(round(friend.position.z + 100), this.world.stage.near)
            )
          }

          this.next_frame = Defines.NEXT_FRAME_AUTO;
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
    this.state?.pre_update?.(this);
    if (this.next_frame) this.enter_frame(this.next_frame);
    if (this.wait > 0) {
      if (!this._catcher && !this._bearer) {
        --this.wait;
      }
    } else {
      const nf = this.get_next_frame(this.frame.next);
      if (nf) this.next_frame = { ...nf.which, judger: void 0 }
      else this.next_frame = this.find_auto_frame()
    }
    this.handle_gravity();
    this.update_velocity();
    this.state?.update(this);
    this.update_position();

    if (this.motionless > 0) {
      ++this.wait;
      --this.motionless;
    }
    if (this.shaking > 0) {
      ++this.wait;
      --this.shaking;
    }
    if (this.update_catching()) return;
    if (this.update_caught()) return;
    const { next_frame, key_list } = this.ctrl.update();
    if (
      key_list === "dja" &&
      this.transform_datas &&
      this.transform_datas[1] === this._data &&
      this._position.y === this.ground_y
    ) {
      this.transfrom_to_another();
      this.ctrl.reset_key_list();
    } else if (next_frame) {
      const result = this.get_next_frame(next_frame)?.which;
      if (result) this.next_frame = result;
    }

    if (!this.shaking && !this.motionless) {
      const { x, y, z } = this._position;
      const ground = this.world.get_ground(this._position)
      const ground_y = ground.get_y(x, y, z)
      if (ground !== this.ground) {
        this.ground.del(this);
        this.ground = ground
        this.ground.add(this);
      }
      const old_ground_y = this.old_ground_y ?? ground_y;
      const on_ground = this._prev_position.y <= old_ground_y;
      const just_land = (this.velocity.y < 0 || !on_ground) && this._position.y <= ground_y
      const itrs = this.itr;

      if (itrs?.length && this.velocity.y < 0) for (const itr of itrs) {
        if (!itr.on_hit_ground) continue;
        if ((this._position.y + this.frame.centery - itr.y - itr.h) > ground_y)
          continue;
        const result = this.get_next_frame(itr.on_hit_ground)
        if (result) this.enter_frame(result.which);
      }

      // 落地
      if (just_land) {
        if (this.frame.on_landing) {
          const result = this.get_next_frame(this.frame.on_landing);
          if (result) this.enter_frame(result.which);
        }
        this._position.y = this._prev_position.y = ground_y;
        this._landing_velocity.x = this._velocity.x
        this._landing_velocity.y = this._velocity.y
        this._landing_velocity.z = this._velocity.z
        this.velocities[0].y = 0;
        this._velocity.y = 0;
        this.state?.on_landing?.(this);
        this.play_sound(this._data.base.drop_sounds);
        if (this.throwinjury) {
          this.hp -= this.throwinjury;
          this.hp_r -= round(this.throwinjury * (1 - this.world.hp_recoverability))
          this.throwinjury = null;
        }
        this._landing_frame = this.frame
      } else if (this.velocity.y == 0 && on_ground && !float_equal(old_ground_y, ground_y)) {
        this._position.y = ground_y;
        this._prev_position.y = ground_y;
      } else if (this._position.y < ground_y) {
        // TODO: allow spawn under ground?
        // this._position.y = ground_y;
        // this._prev_position.y = ground_y;
      }
      if (this._landing_frame !== this.frame) this._landing_frame = null
      this.old_ground_y = ground_y;
    }
    this._holding?.follow_bearer();
    this.collision_list.length = 0;
    this.collided_list.length = 0;
  }

  update_position() {
    if (this.bearer || this.catcher || this.shaking || this.motionless) return;
    let vx = 0, vy = 0, vz = 0;
    for (const v of this.velocities) {
      vx += v.x;
      vy += v.y;
      vz += v.z;
    }
    if (vx) vx = round_float(vx)
    if (vy) vy = round_float(vy)
    if (vz) vz = round_float(vz)
    for (const [, v] of this.blockers) {
      if (
        (vx < 0 && v.attacker.position.x < this._position.x) ||
        (vx > 0 && v.attacker.position.x > this._position.x)
      ) {
        vx = 0;
      }
      if (
        (vz < 0 && v.attacker.position.z < this._position.z) ||
        (vz > 0 && v.attacker.position.z > this._position.z)
      ) {
        vz = 0;
      }
    }
    this._velocity.set(vx, vy, vz);
    if (!this.shaking && !this.motionless) {
      this._prev_position.set(
        this._position.x,
        this._position.y,
        this._position.z
      )
      this.set_position(
        this._position.x + vx,
        this._position.y + vy,
        this._position.z + vz
      )
    }
    this.world.restrict(this);
  }

  /**
   * hp意外归0时，应该去的地方
   * @returns
   */
  get_sudden_death_frame(): TNextFrame {
    return this.state?.get_sudden_death_frame?.(this) || Defines.NEXT_FRAME_AUTO
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
    return this.state?.get_caught_end_frame?.(this) || Defines.NEXT_FRAME_AUTO
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
      this.next_frame = this.get_caught_end_frame();
      return true;
    }

    const frame_a = cer.frame;
    const { cpoint: cp_a } = frame_a;
    if (!cp_a) {
      this._catcher = null;
      this.prev_cpoint_a = null;
      this.set_velocity_y(3);
      this.next_frame = this.get_caught_cancel_frame();
      return true;
    }

    if (this.prev_cpoint_a !== cp_a) {
      const { injury } = cp_a;
      if (injury) {
        this.hp -= injury;
        this.hp_r -= round(injury * (1 - this.world.hp_recoverability))
      }
      if (cp_a.shaking && cp_a.shaking > 0)
        this.shaking = cp_a.shaking;
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
      const nf = this.get_next_frame(cp_a.vaction)?.which
      if (nf) this.next_frame = nf;
      return !!nf
    };
    return false
  }
  drop_catching(): boolean {
    if (!this._catching) return false;
    if (this._catching._catcher === this)
      this._catching._catcher = null;
    this._catching = null;
    this.next_frame = this.get_catching_end_frame();
    return true;
  }
  update_catching(): boolean {
    if (!this._catching) return false;
    if (!this._catch_time) {
      this._catching = null;
      this.next_frame = this.get_catching_end_frame();
      return true;
    }
    const { cpoint: cpoint_a } = this.frame;
    if (cpoint_a?.decrease) {
      this._catch_time += cpoint_a.decrease;
      if (this._catch_time < 0) this._catch_time = 0;
    }
    if (!cpoint_a) {
      this._catching = null;
      this._catch_time = this.catch_time_max;
      this.next_frame = this.get_catching_cancel_frame();
      return true;
    }

    const { throwvx, throwvy, throwvz, throwinjury } = cpoint_a;
    if (throwinjury !== void 0) {
      if (throwinjury > 0) {
        // TODO：丢出后，被丢的人落地后的受到的伤害
        // return;
      } else if (throwinjury === -1) {
        // TODO：变成抓住的人
        if (is_fighter(this) && is_fighter(this._catching)) {
          this.transfrom_to_another(this._catching._data);
          this.next_frame = this.find_auto_frame();
          return true;
        }
      } else {
        this.next_frame = GONE_FRAME_INFO;
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
      const vx = (tx * this.world.tvx_f * a_face)
      const vy = (ty * this.world.tvy_f)
      const vz = (tz * this.world.tvz_f) * (a.ctrl.UD || 0)
      this.set_velocity(vx, vy, vz)
      this.set_position(
        vx + ax - a_face * (afx - acx),
        vy + ay + afy - acy,
        vz + az + acz,
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
    return { id: Builtin_FrameId.Auto };
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
  get_catching_cancel_frame(): INextFrame {
    return { id: Builtin_FrameId.Auto };
  }

  transfrom_to_another(data?: IEntityData) {
    const datas = this.transform_datas = data ?
      [this._data, data] :
      this.transform_datas;
    if (!datas?.length) return;
    const curr_idx = datas.indexOf(this._data)
    const next_idx = (curr_idx + 1) % datas.length;
    const next_data = datas[next_idx]
    this.transform(next_data);
    if (next_idx === 0) {
      const nf = this.get_next_frame({ id: "245" })?.frame ?? this.find_auto_frame()
      this.next_frame = nf;
    }
    if (this.copies.size) {
      const gones = []
      for (const d of this.copies) {
        if (!d.is_attach) gones.push(d)
        else d.transform(next_data)
      }
      for (const d of gones) {
        this.copies.delete(d)
      }
    }
  }

  start_catch(target: Entity, itr: IItrInfo) {
    if (itr.catchingact === void 0) {
      Ditto.warn(`[Entity::start_caught] cannot catch, catchingact got ${itr.catchingact}`);
      return;
    }
    this._catch_time = this.catch_time_max;
    this._catching = target;
    const next_frame = this.get_next_frame(itr.catchingact)?.which || null;
    if (next_frame) this.enter_frame(next_frame)
    this.next_frame = null
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
    const next_frame = this.get_next_frame(itr.caughtact)?.which || null;
    if (next_frame) this.enter_frame(next_frame)
    this.next_frame = null
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
      is_fighter(target) && target.frame.state === StateEnum.Tired &&
      ((this.velocity.x > 0 && target.position.x > this._position.x) ||
        (this.velocity.x < 0 && target.position.x < this._position.x))
    );
  }

  dispose(): void {
    this._is_attach = false;
    this.world.del_entity(this);
    this.ctrl.dispose();
    this.callbacks.emit("on_disposed")(this);
    this.callbacks.clear()
    this.reset(this.world, this.data, this.states);
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

  update_chasing(lookup: Entity) {
    const a = this.chasing;
    const b = this.should_chase(a) ? a : this.chasing = null;
    const c = this.should_chase(lookup) ? lookup : null;
    const d = this.chasing = closer_one(this, b, c);
    // lost
    if (!d && a) this.ctrl.set_chase_pos(
      this.position.x,
      this.position.y,
      this.position.z
    )
    // follow
    if (d) this.ctrl.set_chase_pos(
      d.position.x,
      d.position.y,
      d.position.z
    )
  }
  should_chase(other: Entity | null): boolean {
    if (!other) return false;
    if (
      other.frame.id === Builtin_FrameId.Gone ||
      other.frame.id === Builtin_FrameId.None
    ) return false;
    const { chase } = this.frame;
    if (!chase) return false;
    const { flag } = chase
    const target = other.get_flag(this)
    return (target & flag) == target
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

    if (wp_a.weaponact !== this.frame.id) {
      // 还原wpoint丢失的情况
      if (wp_a.weaponact)
        this.enter_frame({ id: wp_a.weaponact });
      else
        this.enter_frame(this.find_auto_frame());
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

    if (wp_a) {
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
      dvx = strength * (dvx || 0) / weight;
      dvy = strength * (dvy || 0) / weight;
      const vx = (dvx - abs(vz / 2)) * this.facing;
      this.set_velocity(vx, dvy, vz);
      bearer.holding = null;
      this.bearer = null;
      return;
    }

  }

  enter_frame(which: TNextFrame): void {
    if (this.frame.id === Builtin_FrameId.Gone)
      return;

    const result = this.get_next_frame(which);
    if (!result) {
      this.next_frame = null;
      return;
    }
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
          let { centerx, pic: { w = 0 } = {} } = frame;
          let { cam_x } = this.world.renderer;
          let cam_r = cam_x + this.world.screen_w;
          const offset_x = this.facing === 1 ? centerx : w - centerx;
          cam_r -= w - offset_x
          cam_x += offset_x
          x = clamp(x, cam_x, cam_r)
        }
        this.world.lf2.sounds.play(frame.sound, x, y, z);
      }
      this.set_frame(frame);
    } else if (this.frame === EMPTY_FRAME_INFO) {
      this.set_frame(this.find_auto_frame());
    }

    this.next_frame = null;
    if (flags.id === Builtin_FrameId.Auto) {
      this.a_rest = 0;
      for (const [_, v] of this.victims)
        v.rest = 0;
      this.victims.clear()
    }

    if (flags.facing !== void 0) {
      this.facing = this.handle_facing_flag(flags.facing);
    }
    if (flags.wait !== void 0) {
      this.wait = this.handle_wait_flag(flags.wait, frame);
    } else if (frame) {
      this.wait = frame.wait + this.world.frame_wait_offset;
    }
    if (flags.sounds?.length) this.play_sound(flags.sounds);

    if (flags.blink_time) this.blinking = flags.blink_time;
  }

  handle_wait_flag(wait: string | number, frame?: IFrameInfo): number {
    if (is_positive(wait)) return wait;
    if (wait === "i" || !frame) return this.wait;
    if (wait === "d") return max(0, frame.wait - this.frame.wait + this.wait);
    return frame.wait + this.world.frame_wait_offset;
  }

  /**
   * 进入下一帧时，需要处理朝向
   *
   * @see {FacingFlag}
   * @param facing 目标朝向, 可参考FacingFlag
   * @param frame 帧
   * @returns 返回新的朝向
   */
  handle_facing_flag(facing: number): -1 | 1 {
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
        if (use_mp && this._mp < use_mp) return void 0;
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
    const r = this.state?.find_frame_by_id?.(this, id);
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

  merge_velocities(vx?: number, vy?: number, vz?: number) {
    if (this.velocities.length <= 1) {
      const { x, y, z } = this.velocities[0]
      this.set_velocity(vx ?? x, vy ?? y, vz ?? z);
    } else {
      let x = 0, y = 0, z = 0;
      for (const v of this.velocities) {
        x += v.x;
        y += v.y;
        z += v.z;
      }
      this.set_velocity(vx ?? x, vy ?? y, vz ?? z)
    }
  }
  set_velocity_0_x(x: number) {
    if (is_f_num(x)) debugger;
    const v = this.velocity_0;
    if (v.x !== x) this.velocities[0].x = round_float(x)
  }
  set_velocity_0_y(y: number) {
    if (is_f_num(y)) debugger;
    const v = this.velocity_0;
    if (v.y !== y) this.velocities[0].y = round_float(y)
  }
  set_velocity_0_z(z: number) {
    if (is_f_num(z)) debugger;
    const v = this.velocity_0;
    if (v.z !== z) this.velocities[0].z = round_float(z)
  }
  set_velocity_1_x(x: number) {
    if (is_f_num(x)) debugger;
    const v = this.velocity_1;
    if (v.x !== x) this.velocities[1].x = round_float(x)
  }
  set_velocity_1_y(y: number) {
    if (is_f_num(y)) debugger;
    const v = this.velocity_1;
    if (v.y !== y) this.velocities[1].y = round_float(y)
  }
  set_velocity_1_z(z: number) {
    if (is_f_num(z)) debugger;
    const v = this.velocity_1;
    if (v.z !== z) this.velocities[1].z = round_float(z)
  }
  set_velocity_0(
    x?: number | null,
    y?: number | null,
    z?: number | null,
  ) {
    if (x !== null && x !== void 0) this.set_velocity_0_x(x)
    if (y !== null && y !== void 0) this.set_velocity_0_y(y)
    if (z !== null && z !== void 0) this.set_velocity_0_z(z)
  }
  set_velocity_1(
    x?: number | null,
    y?: number | null,
    z?: number | null,
  ) {
    if (x !== null && x !== void 0) this.set_velocity_1_x(x)
    if (y !== null && y !== void 0) this.set_velocity_1_y(y)
    if (z !== null && z !== void 0) this.set_velocity_1_z(z)
  }
  set_velocity(
    x?: number | null,
    y?: number | null,
    z?: number | null,
  ) {
    if (is_f_num(x) || is_f_num(y) || is_f_num(z)) debugger;
    this.velocities.length = 1;
    x = (x === null || x === void 0) ? this.velocity.x : x ? round_float(x) : x
    y = (y === null || y === void 0) ? this.velocity.y : y ? round_float(y) : y
    z = (z === null || z === void 0) ? this.velocity.z : z ? round_float(z) : z
    this.velocities[0].set(x, y, z);
    this._velocity.set(x, y, z);
  }
  set_velocity_x(x: number) {
    if (is_f_num(x)) debugger;
    if (this.velocities.length > 1) this.merge_velocities(x, void 0, void 0)
    else this.set_velocity_0_x(x)
  }
  set_velocity_y(y: number) {
    if (is_f_num(y)) debugger;
    if (this.velocities.length > 1) this.merge_velocities(void 0, y, void 0)
    else this.set_velocity_0_y(y)
  }
  set_velocity_z(z: number) {
    if (is_f_num(z)) debugger;
    if (this.velocities.length > 1) this.merge_velocities(void 0, void 0, z)
    else this.set_velocity_0_z(z)
  }
  set_position(x?: number | null, y?: number | null, z?: number | null) {
    if (is_f_num(x) || is_f_num(y) || is_f_num(z)) debugger;
    if (x !== null && x !== void 0) this._position.x = x ? round_float(x) : x
    if (y !== null && y !== void 0) this._position.y = y ? round_float(y) : y
    if (z !== null && z !== void 0) this._position.z = z ? round_float(z) : z
  }
  set_position_x(x: number) {
    if (is_f_num(x)) debugger;
    this._position.x = x ? round_float(x) : x
  }
  set_position_y(y: number) {
    if (is_f_num(y)) debugger;
    this._position.y = y ? round_float(y) : y
  }
  set_position_z(z: number) {
    if (is_f_num(z)) debugger;
    this._position.z = z ? round_float(z) : z
  }
  transform(data: IEntityData) {
    if (!is_human_ctrl(this.ctrl))
      this.ctrl = Factory.inst.create_ctrl(data.id, this.ctrl.player_id, this);
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
    return this.v_rests.get(a_id)?.rest || 0;
  }
  add_v_rest(c: ICollision) {
    this.v_rests.set(c.a_id, c);
    if (c.itr.kind === ItrKind.Block) this.blockers.set(c.a_id, c);
    if (c.itr.kind === ItrKind.SuperPunchMe) this.superpunchs.set(c.a_id, c);
  }
  del_v_rest(a_id: string) {
    this.v_rests.delete(a_id);
    this.blockers.delete(a_id);
    this.superpunchs.delete(a_id);
  }

  world_dataset<K extends keyof Partial<IWorldDataset>>(name: K): IWorldDataset[K] {
    const v = (this.frame as Partial<IWorldDataset>)[name]
    return v ?? this.world[name]
  }
}

const common_creator: ICreator<Entity, typeof Entity> = (...args) => {
  const type = args[1].type;
  let ret = Factory.inst.acquire(type)
  if (!ret) ret = new Entity(...args)
  else ret.reset(...args)
  return ret
}
Factory.inst.set_entity_creator(EntityEnum.Ball, common_creator);
Factory.inst.set_entity_creator(EntityEnum.Weapon, common_creator);
Factory.inst.set_entity_creator(EntityEnum.Entity, common_creator);
Factory.inst.set_entity_creator(EntityEnum.Fighter, common_creator);
