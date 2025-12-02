import type { LF2 } from "../LF2";
import type { World } from "../World";
import { Callbacks, ICollision, new_id, new_team, type NoEmitCallbacks } from "../base";
import { BaseController } from "../controller/BaseController";
import { InvalidController } from "../controller/InvalidController";
import {
  Builtin_FrameId,
  BuiltIn_OID,
  Defines, EntityEnum, EntityGroup, FacingFlag, FrameBehavior, IBaseData, IBounding,
  ICpointInfo, IEntityData, IFrameInfo,
  IItrInfo,
  INextFrame,
  INextFrameResult,
  IOpointInfo, IPos,
  ItrKind,
  IVector3,
  OpointKind, OpointMultiEnum, OpointSpreading, SpeedMode, StateEnum, TFace,
  TNextFrame
} from "../defines";
import { EMPTY_FRAME_INFO } from "../defines/EMPTY_FRAME_INFO";
import { GONE_FRAME_INFO } from "../defines/GONE_FRAME_INFO";
import { IArmorInfo } from "../defines/IArmorInfo";
import { Ditto } from "../ditto";
import { States } from "../state";
import { ENTITY_STATES } from "../state/ENTITY_STATES";
import { State_Base } from "../state/State_Base";
import { Times } from "../ui/utils/Times";
import { abs, clamp, find, floor, intersection, max, min, round } from "../utils";
import { cross_bounding } from "../utils/cross_bounding";
import { is_num, is_positive, is_str } from "../utils/type_check";
import { DrinkInfo } from "./DrinkInfo";
import { Factory } from "./Factory";
import type IEntityCallbacks from "./IEntityCallbacks";
import { calc_v } from "./calc_v";
import { turn_face } from "./face_helper";
import { IDebugging, make_debugging } from "./make_debugging";
import { is_character, is_local_ctrl, is_weapon_data } from "./type_check";
export type TData = IBaseData | IEntityData;
export interface IDeadJoin {
  hp?: number;
  team?: string;
}
export class Entity implements IDebugging {

  static readonly TAG: string = 'Entity';
  debug!: (_0: string, ..._1: any[]) => void;
  warn!: (_0: string, ..._1: any[]) => void;
  log!: (_0: string, ..._1: any[]) => void;

  id: string = new_id();
  wait: number = 0;
  update_id = new Times(0, Number.MAX_SAFE_INTEGER);
  variant: number = 0;
  transform_datas?: [IEntityData, IEntityData];
  readonly src_data: Readonly<IEntityData>;
  protected _data: IEntityData;
  protected _reserve = 0;
  protected _is_attach: boolean = false;
  protected _is_incorporeity: boolean = false;
  protected _landing_frame?: IFrameInfo;
  protected _hp_r_tick: Times;
  protected _mp_r_tick: Times;

  readonly world: World;
  readonly position = new Ditto.Vector3(0, 0, 0);
  drink: DrinkInfo | undefined;
  fuse_bys?: Entity[];
  dismiss_time?: number;
  dismiss_data?: IEntityData;
  doppelgangers = new Set<Entity>();
  has_stat_bar: boolean = false;
  get data(): IEntityData { return this._data };
  get group() { return this._data.base.group };
  get is_attach() { return this._is_attach }
  get is_incorporeity() { return this._is_incorporeity }
  get reserve(): number {
    return this._reserve;
  }
  set reserve(v: number) {
    const o = this._reserve;
    if (o === v) return;
    this._reserve = v;
    this._callbacks.emit("on_reserve_changed")(this, v, o);
  }

  get type() {
    return this._data.type;
  }
  get itr() {
    return this.frame.itr;
  }
  get bdy() {
    return this.frame.bdy;
  }
  protected _toughness_resting_max = Defines.DEFAULT_TOUGHNESS_RESTING_MAX;
  get toughness_resting_max(): number {
    return this._toughness_resting_max;
  }
  set toughness_resting_max(v: number) {
    const o = this._toughness_resting_max;
    if (o === v) return;
    this._toughness_resting_max = v;
  }

  protected _resting_max = Defines.DEFAULT_RESTING_MAX;
  get resting_max(): number {
    return this._resting_max;
  }
  set resting_max(v: number) {
    const o = this._resting_max;
    if (o === v) return;
    this._resting_max = v;
    this._callbacks.emit("on_resting_max_changed")(this, v, o);
  }

  protected _resting = 0;
  get resting() {
    return this._resting;
  }
  set resting(v: number) {
    const o = this._resting;
    if (o === v) return;
    this._resting = v;
    this._callbacks.emit("on_resting_changed")(this, v, o);
  }

  private _fall_value = Defines.DEFAULT_FALL_VALUE_MAX;
  get fall_value(): number { return this._fall_value; }
  set fall_value(v: number) {
    const o = this._fall_value;
    if (o === v) return;
    this._fall_value = v;
    if (v < o) {
      this.resting = this.resting_max;
      this.toughness_resting = this.toughness_resting_max;
    }
    this._callbacks.emit("on_fall_value_changed")(this, v, o);
  }

  private _toughness = 0;
  get toughness(): number {
    return this._toughness;
  }
  set toughness(v: number) {
    const o = this._toughness;
    if (o === v) return;
    this._toughness = v;
    if (v < o) this.toughness_resting = this.toughness_resting_max;
    this._callbacks.emit("on_toughness_changed")(this, v, o);
  }

  private _toughness_max = 0;
  get toughness_max(): number {
    return this._toughness_max;
  }
  set toughness_max(v: number) {
    const o = this._toughness_max;
    if (o === v) return;
    this._toughness_max = v;
    this._callbacks.emit("on_toughness_max_changed")(this, v, o);
  }

  protected _toughness_resting = 0;
  get toughness_resting() {
    return this._toughness_resting;
  }
  set toughness_resting(v: number) {
    const o = this._toughness_resting;
    if (o === v) return;
    this._toughness_resting = v;
  }


  private _fall_value_max = Defines.DEFAULT_FALL_VALUE_MAX;
  get fall_value_max(): number {
    return this._fall_value_max;
  }
  set fall_value_max(v: number) {
    const o = this._fall_value_max;
    if (o === v) return;
    this._fall_value_max = v;
    this._callbacks.emit("on_fall_value_max_changed")(this, v, o);
  }

  private _defend_value = Defines.DEFAULT_DEFEND_VALUE_MAX;
  get defend_value(): number {
    return this._defend_value;
  }
  set defend_value(v: number) {
    const o = this._defend_value;
    if (o === v) return;
    this._defend_value = v;
    if (v < o) {
      this.resting = this.resting_max;
      this.toughness_resting = this.toughness_resting_max;
    }
    this._callbacks.emit("on_defend_value_changed")(this, v, o);
  }

  private _defend_value_max = Defines.DEFAULT_DEFEND_VALUE_MAX;
  get defend_value_max(): number {
    return this._defend_value_max;
  }
  set defend_value_max(v: number) {
    const o = this._defend_value_max;
    if (o === v) return;
    this._defend_value_max = v;
    this._callbacks.emit("on_defend_value_max_changed")(this, v, o);
  }


  private _healing: number = 0;
  get healing(): number {
    return this._healing;
  }
  set healing(v: number) {
    if (this._hp_r === this._hp)
      v = 0
    const o = this._healing;
    if (o === v) return;
    this._healing = v;
    this._callbacks.emit("on_healing_changed")(this, v, o);
  }


  private _defend_ratio: number = Defines.DEFAULT_DEFEND_INJURY_RATIO;
  get defend_ratio(): number {
    return this._defend_ratio;
  }
  set defend_ratio(v: number) {
    const o = this._defend_ratio;
    if (o === v) return;
    this._defend_ratio = v;
  }

  throwinjury?: number;

  get catching() {
    return this._catching;
  }
  get catcher() {
    return this._catcher;
  }
  get lf2(): LF2 {
    return this.world.lf2;
  }

  // private ___facing: TFace = 1;
  // get facing(): TFace { return this.___facing; }
  // set facing(v: TFace) { this.___facing = v; }
  facing: TFace = 1;

  frame: IFrameInfo = EMPTY_FRAME_INFO;

  // next_frame: INextFrame | undefined = void 0;
  private ___next_frame: INextFrame | undefined = void 0;
  get next_frame(): INextFrame | undefined {
    return this.___next_frame;
  }
  set next_frame(v: INextFrame | undefined) {
    this.___next_frame = v;
  }

  protected _prev_frame: IFrameInfo = EMPTY_FRAME_INFO;
  protected _catching?: Entity;
  protected _catcher?: Entity;
  readonly states: States;

  /**
   * 最终速度向量
   * - 每次更新position前，通过velocities计算得出
   * - 直接修改速度向量将不会影响position的计算，
   * - 直接修改会影响到使用其他到velocity判断的逻辑，所以别直接改
   * @readonly
   * @type {IVector3}
   */
  readonly velocity: IVector3 = new Ditto.Vector3(0, 0, 0);

  /**
   * 速度向量数组
   *
   * @readonly
   * @type {IVector3[]}
   */
  readonly velocities: IVector3[] = [new Ditto.Vector3(0, 0, 0)];
  get velocity_0(): IVector3 {
    if (this.velocities.length) return this.velocities[0]!;
    return this.velocities[0] = new Ditto.Vector3(0, 0, 0);
  }
  get velocity_1(): IVector3 {
    if (this.velocities.length > 1) return this.velocities[1]!;
    return this.velocities[1] = new Ditto.Vector3(0, 0, 0);
  }

  protected _callbacks = new Callbacks<IEntityCallbacks>();

  /**
   * 实体名称
   *
   * @protected
   * @type {string}
   */
  protected _name: string = "";

  /**
   * 所属队伍
   *
   * @protected
   * @type {string}
   */
  protected _team: string = new_team();

  protected _mp: number = Defines.DEFAULT_MP;
  protected _mp_max: number = Defines.DEFAULT_MP;


  protected _hp: number = Defines.DEFAULT_HP;
  protected _hp_r: number = Defines.DEFAULT_HP;
  protected _hp_max: number = Defines.DEFAULT_HP;

  protected _holder?: Entity;
  protected _holding?: Entity;
  protected _emitter?: Entity;
  protected _emitter_opoint?: IOpointInfo;
  /** 当前角色 */
  public a_rest: number = 0;
  public v_rests = new Map<string, ICollision>();
  public victims = new Map<string, ICollision>()

  public motionless: number = 0;
  public shaking: number = 0;

  /**
   * 抓人剩余值
   *
   * 当抓住一个被击晕的人时，此值充满。
   */
  protected _catch_time = Defines.DEFAULT_CATCH_TIME;
  protected _catch_time_max = Defines.DEFAULT_CATCH_TIME;

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
   * @type {string | TNextFrame}
   */
  protected _after_blink: string | TNextFrame | null = null;

  /**
   * 拾取物件总数
   *
   * @protected
   * @type {number}
   */
  protected _picking_sum: number = 0;

  /**
   * 伤害总数
   *
   * @protected
   * @type {number}
   */
  protected _damage_sum: number = 0;

  /**
   * 击杀总数
   *
   * @protected
   * @type {number}
   */
  protected _kill_sum: number = 0;

  /**
   * 拾取物件总数
   *
   * @protected
   * @type {number}
   */
  get picking_sum() {
    return this._picking_sum;
  }

  /**
   * 伤害总数
   *
   * @protected
   * @type {number}
   */
  get damage_sum() {
    return this._damage_sum;
  }

  /**
   * 击杀总数
   *
   * @readonly
   * @type {number}
   */
  get kill_sum() {
    return this._kill_sum;
  }

  get holder(): Entity | undefined {
    return this._holder;
  }

  set holder(v: Entity | undefined) {
    this.set_holder(v);
  }

  get holding(): Entity | undefined {
    return this._holding;
  }

  set holding(v: Entity | undefined) {
    this.set_holding(v);
  }

  get name(): string {
    return this._name;
  }

  set name(v: string) {
    if (v === this._name) return;
    const o = this._name;
    this._callbacks.emit("on_name_changed")(this, (this._name = v), o);
  }

  get mp(): number {
    return this._mp;
  }
  set mp(v: number) {
    const o = this._mp;
    v = max(0, v)
    if (o === v) return;
    this._callbacks.emit("on_mp_changed")(this, (this._mp = v), o);
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
    this._callbacks.emit("on_hp_r_changed")(this, (this._hp_r = v), o);
  }

  get hp(): number {
    return this._hp;
  }
  set hp(v: number) {
    const o = this._hp;
    v = max(0, v)
    if (o === v) return;
    this._callbacks.emit("on_hp_changed")(this, (this._hp = v), o);
    if (o > 0 && v <= 0) {

      this._callbacks.emit("on_dead")(this);
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

  play_sound(sounds: string[] | undefined, pos: IPos = this.position) {
    if (!sounds?.length) return;
    const sound = this.lf2.random_get(sounds);
    if (!sound) return;
    const { x, y, z } = pos;
    this.lf2.sounds.play(sound, x, y, z);
  }

  get mp_max(): number {
    return this._mp_max;
  }
  set mp_max(v: number) {
    const o = this._mp_max;
    v = max(0, v)
    this._callbacks.emit("on_mp_max_changed")(this, (this._mp_max = v), o);
  }

  get hp_max(): number {
    return this._hp_max;
  }
  set hp_max(v: number) {
    const o = this._hp_max;
    v = max(0, v)
    this._callbacks.emit("on_hp_max_changed")(this, (this._hp_max = v), o);
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
    this._callbacks.emit("on_team_changed")(this, v, o);
  }

  get emitter() {
    return this._emitter;
  }

  protected _state: State_Base | undefined;

  set state(v: State_Base | undefined) {
    if (this._state === v) return;
    this._state?.leave?.(this, this.frame);
    this._state = v;
    this._state?.enter?.(this, this.get_prev_frame());
  }

  get state() {
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
  get callbacks(): NoEmitCallbacks<IEntityCallbacks> {
    return this._callbacks;
  }

  protected _ctrl: BaseController;
  get ctrl(): BaseController {
    return this._ctrl;
  }
  set ctrl(v: BaseController | undefined) {
    if (!v) return;
    if (this._ctrl === v) return;
    this._ctrl?.dispose();
    this._ctrl = v;
  }
  private _key_role: boolean | null = null;
  private _dead_gone: boolean | null = null;
  private _dead_join: IDeadJoin | null = null;
  get key_role(): boolean {
    if (this._key_role !== null) return this._key_role;
    const is_player = !!this.ctrl?.player_id;
    const is_key = !!intersection(this._data.base.group, [EntityGroup.Regular, EntityGroup.Boss]).length
    return this._key_role = is_player || is_key;
  }
  set key_role(v: boolean | null) {
    if (this._key_role === v) return;
    this._key_role = v;
    this._callbacks.emit("on_name_changed")(this, this._name, this._name);
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

  armor?: Readonly<IArmorInfo>

  constructor(world: World, data: IEntityData, states: States = ENTITY_STATES) {
    this._data = data;
    this.src_data = data;
    this.world = world;
    this.states = states;
    this._hp_r_tick = new Times(0, world.hp_r_ticks);
    this._mp_r_tick = new Times(0, world.mp_r_ticks)
    this._hp_max = data.base.hp ?? Defines.DEFAULT_HP;
    this._ctrl = new InvalidController("", this);

    if (is_weapon_data(data) && data.id === "122") {
      this._mp_max = data.base.mp ?? Defines.DEFAULT_MILK_MP;
    } else if (is_weapon_data(data) && data.id === "123") {
      this._mp_max = data.base.mp ?? Defines.DEFAULT_BEER_MP;
    } else {
      this._mp_max = data.base.mp ?? Defines.DEFAULT_MP;
    }
    this._defend_ratio = data.base.defend_ratio ?? Defines.DEFAULT_DEFEND_INJURY_RATIO;

    const { armor } = this._data.base
    this.armor = armor
    if (armor) {
      this.toughness = this.toughness_max = armor.toughness
    }

    this._catch_time_max = data.base.catch_time ?? Defines.DEFAULT_CATCH_TIME;
    this.fall_value_max =
      this._data.base.fall_value ?? Defines.DEFAULT_FALL_VALUE_MAX;
    this.defend_value_max =
      this._data.base.defend_value ?? Defines.DEFAULT_DEFEND_VALUE_MAX;
    this.resting_max =
      this._data.base.resting ?? Defines.DEFAULT_RESTING_MAX;

    this.fall_value = this.fall_value_max;
    this.defend_value = this.defend_value_max;
    this._hp = this._hp_r = this._hp_max;
    this._mp = this._mp_max;
    this._catch_time = this._catch_time_max;
    make_debugging(this)
    this.drink = data.base.drink ? new DrinkInfo(data.base.drink) : void 0
  }
  set_holder(v: Entity | undefined): this {
    if (this._holder === v) return this;
    const old = this._holder;
    this._holder = v;
    this._callbacks.emit("on_holder_changed")(this, v, old);
    return this;
  }

  set_holding(v: Entity | undefined): this {
    if (this._holding === v) return this;
    const old = this._holding;
    this._holding = v;
    this._callbacks.emit("on_holding_changed")(this, v, old);

    if (v) {
      this._picking_sum += 1;
      this._callbacks.emit("on_picking_sum_changed")(
        this,
        this._picking_sum,
        this._picking_sum - 1,
      );
    }
    return this;
  }

  /**
   * 增加伤害值数量
   * 
   * emitter的伤害值数量也同样增加
   * 
   * 会触发话回调 on_damage_sum_changed
   *
   * @param {number} v 伤害值计算
   * @return {this}
   * @memberof Entity
   */
  add_damage_sum(v: number): this {
    const old = this._damage_sum;
    this._damage_sum += v;
    this._callbacks.emit("on_damage_sum_changed")(this, this._damage_sum, old);
    this.emitter?.add_damage_sum(v);
    return this;
  }

  /**
   * 增加击杀数量
   * 
   * emitter的击杀数量也同样增加
   * 
   * 会触发话回调 on_kill_sum_changed
   *
   * @param {number} v 击杀数量 
   * @return {this}
   * @memberof Entity
   */
  add_kill_sum(v: number): this {
    const old = this._kill_sum;
    this._kill_sum += v;
    this._callbacks.emit("on_kill_sum_changed")(this, this._kill_sum, old);
    this.emitter?.add_kill_sum(v);
    return this;
  }

  get_v_rest(id: string): number {
    const v = this.v_rests.get(id);
    return v?.v_rest ?? 0;
  }

  find_auto_frame(): IFrameInfo {
    return (
      this.state?.get_auto_frame?.(this) ?? this._data.frames["0"] ?? this.frame
    ); // FIXME: fix this 'as'.
  }

  find_emitter(fn: (e: Entity) => boolean): Entity | undefined {
    if (!this.emitter) return void 0;
    if (fn(this.emitter)) return this.emitter;
    return this.emitter.find_emitter(fn);
  }

  on_spawn(
    emitter: Entity,
    opoint: IOpointInfo,
    offset_velocity: IVector3 = new Ditto.Vector3(0, 0, 0),
    facing: TFace = emitter.facing,
  ) {
    this._emitter = emitter;
    this._emitter_opoint = opoint;

    const emitter_frame = emitter.frame;
    if (
      emitter.frame.state === StateEnum.Ball_Rebounding ||
      emitter.frame.state === StateEnum.Ball_Flying
    ) {
      this.team = (emitter.lastest_collided?.attacker ?? emitter).team;
      this.facing = emitter.facing;
    } else {
      this.team = emitter.team;
      this.facing = emitter.facing;
    }
    const { origin_type } = opoint
    let { x, y, z } = emitter.position;
    if (origin_type === 1) {
      y = y - opoint.y;
      x = x + emitter.facing * opoint.x;
    } else {
      y = y + emitter_frame.centery - opoint.y;
      x = x - emitter.facing * (emitter_frame.centerx - opoint.x);
    }

    this.position.set(
      round(x),
      round(y),
      round(z + (opoint.z ?? 0))
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
    o_dvx /= weight;
    o_dvy /= weight;

    let ud = emitter.ctrl?.UD || 0;
    let { x: ovx, y: ovy, z: ovz } = offset_velocity;
    if (o_dvx > 0) {
      o_dvx = o_dvx - abs(ovz / 2);
    } else {
      o_dvx = o_dvx + abs(ovz / 2);
    }

    if (is_num(opoint.max_hp)) this.hp = this.hp_r = this.hp_max = opoint.max_hp;
    if (is_num(opoint.hp)) this.hp = this.hp_r = opoint.hp;

    if (is_num(opoint.max_mp)) this.mp = this.mp_max = opoint.max_mp;
    if (is_num(opoint.mp)) this.mp = opoint.mp;

    this.velocities.length = 0

    const { dvy = 0, dvz = 0 } = this.frame
    this.velocities.push(
      new Ditto.Vector3(
        ovx + o_dvx * facing,
        ovy + o_dvy + dvy,
        ovz + o_dvz + o_speedz * ud + dvz
      ),
    )
    if (
      result?.frame?.state === StateEnum.Normal ||
      result?.frame?.state === StateEnum.Burning
    ) {
      this.merge_velocities()
      this.velocity_0.z = 0;
    }
    switch (opoint.kind) {
      case OpointKind.Pick:
        emitter.drop_holding()
        this.holder = emitter;
        this.holder.holding = this;
        break;
    }
    return this;
  }
  get_opoint_speed_z(emitter: Entity, opoint: IOpointInfo): number {
    if (opoint.speedz !== void 0) return opoint.speedz;
    if (!is_character(emitter)) return 0;
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
  _opoints: [IOpointInfo, number][] = [];

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
      this.state?.on_frame_changed?.(this, this.frame, this._prev_frame)
    }
    if (v.invisible) this.invisibility(v.invisible);
    if (v.opoint) this.apply_opoints(v.opoint);
    if (!v.cpoint) {
      delete this._catching;
      delete this._catcher;
    }
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
        multi_type = multi.type
        switch (multi.type) {
          case OpointMultiEnum.AccordingEnemies:
            enemies = this.world.list_enemy_fighters(this, o => o.hp > 0)
            count = max(multi.min, enemies.length);
            break;
          case OpointMultiEnum.AccordingAllies:
            allies = this.world.list_ally_fighters(this, o => o.hp > 0)
            count = max(multi.min, allies.length);
            break;
        }
      }
      let facing = this.facing;
      for (let i = 0; i < count; ++i) {
        const v = new Ditto.Vector3(0, 0, 0);
        switch (opoint.spreading) {
          case void 0:
          case OpointSpreading.Normal:
            v.z = (i - (count - 1) / 2) * 3.5;
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
          case FrameBehavior.FirzenDisasterStart:
          case FrameBehavior.FirzenVolcanoStart:
          case FrameBehavior.BatStart:
          case FrameBehavior.DevilJudgementStart:
            if (multi_type === OpointMultiEnum.AccordingEnemies) {
              e.chasing = enemies[i % enemies.length]
              if (e.chasing) {
                e.facing = (e.chasing.position.x > e.position.x) ? 1 : -1
                e.merge_velocities();
                e.velocity_0.x = (e.facing * abs(e.velocity_0.x))
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
    const oid = this.lf2.random_get(opoint.oid);
    if (!oid) {
      Ditto.warn(Entity.TAG + "::spawn_object", "oid got", oid);
      return;
    }
    const data = this.world.lf2.datas.find(oid);
    if (!data) {
      Ditto.warn(
        Entity.TAG + "::spawn_object",
        "data not found! opoint:",
        opoint,
      );
      return;
    }
    const create = Factory.inst.get_entity_creator(data.type);
    if (!create) {
      Ditto.warn(
        Entity.TAG + "::spawn_object",
        `creator of "${data.type}" not found! opoint:`,
        opoint,
      );
      return;
    }
    const entity = create(this.world, data);
    entity.ctrl = Factory.inst.get_ctrl(entity._data.id, "", entity,) ?? entity.ctrl;
    entity.on_spawn(this, opoint, offset_velocity, facing).attach(opoint.is_entity);
    if (entity.data.id === this.data.id) this.doppelgangers.add(entity)
    entity.key_role = false;
    entity.dead_gone = true;

    for (const [k, v] of this.v_rests) {
      /*
      Note: 继承v_rests，避免重复反弹ball...
      */
      entity.v_rests.set(k, { ...v });
    }

    return entity;
  }

  attach(is_entity = true): this {
    this._is_attach = true
    this._is_incorporeity = !is_entity
    if (is_entity)
      this.world.add_entities(this);
    else
      this.world.add_incorporeities(this);

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
   * - 实体处于地面以上(不含地面，即：position.y > 0）
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
    if (this.position.y > 0 || this.shaking || this.motionless) return;
    let { x, z } = this.velocity_0;
    const is_landing_frame = this._landing_frame === this.frame;

    factor *= this.frame.friction_factor ?? this.world.friction_factor;
    x *= factor;
    z *= factor;

    const fx = this.frame.friction_x ?? (is_landing_frame ? this.world.land_friction_x : this.world.friction_x)
    if (x > 0) {
      x -= fx;
      if (x < 0) x = 0; // 不能因为摩擦力反向加速
    } else if (x < 0) {
      x += fx;
      if (x > 0) x = 0; // 不能因为摩擦力反向加速
    }

    const fz = this.frame.friction_z ?? (is_landing_frame ? this.world.land_friction_z : this.world.friction_z)
    if (z > 0) {
      z -= fz;
      if (z < 0) z = 0; // 不能因为摩擦力反向加速
    } else if (z < 0) {
      z += fz;
      if (z > 0) z = 0; // 不能因为摩擦力反向加速
    }

    this.velocity_0.x = x;
    this.velocity_0.z = z;
  }

  handle_velocity_decay(friction: number) {
    let { x, z } = this.velocity_0;
    if (x > 0) {
      x -= friction;
      if (x < 0) x = 0; // 不能因为摩擦力反向加速
    } else if (x < 0) {
      x += friction;
      if (x > 0) x = 0; // 不能因为摩擦力反向加速
    }

    if (z > 0) {
      z -= friction;
      if (z < 0) z = 0; // 不能因为摩擦力反向加速
    } else if (z < 0) {
      z += friction;
      if (z > 0) z = 0; // 不能因为摩擦力反向加速
    }

    this.velocity_0.x = x;
    this.velocity_0.z = z;
  }

  /**
   * 实体响应重力
   *
   * 本质就是增加y轴方向向下的速度，
   * 有`velocity.y -= State_Base.get_gravity() ?? World.gravity`
   *
   * 以下情况不响应重力:
   *
   * - 实体处于地面或地面以下（position.y <= 0）
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
    const { gravity_enabled = true } = this.frame;
    if (this.position.y <= 0 || this.shaking || this.motionless || !gravity_enabled) return;
    this.velocity_0.y -= this.frame.gravity ?? this.state?.get_gravity(this) ?? this.world.gravity;
  }

  private handle_frame_velocity() {
    if (this.shaking || this.motionless) return;
    const {
      acc_x,
      acc_y,
      acc_z,
      dvx,
      dvy,
      dvz,
      vxm = SpeedMode.LF2,
      vym = SpeedMode.Acc,
      vzm = SpeedMode.LF2,
      ctrl_x = 0,
      ctrl_y = 0,
      ctrl_z = 0,
    } = this.frame;
    let { x: vx, y: vy, z: vz } = this.velocity_0;

    const { UD, LR, jd } = this._ctrl;

    if (!ctrl_x && dvx != void 0) vx = calc_v(vx, dvx * this.world.fvx_f, vxm, acc_x, this.facing);
    else if (LR && dvx != void 0) vx = calc_v(vx, dvx * this.world.fvx_f, vxm, acc_x, LR);

    if (!ctrl_y && dvy != void 0) vy = calc_v(vy, dvy * this.world.fvy_f, vym, acc_y, 1);
    else if (jd && dvy != void 0) vy = calc_v(vy, dvy * this.world.fvy_f, vym, acc_y, jd);

    if (!ctrl_z && dvz != void 0) vz = calc_v(vz, dvz * this.world.fvz_f, vzm, acc_z, 1);
    else if (UD && dvz != void 0) vz = calc_v(vz, dvz * this.world.fvz_f, vzm, acc_z, UD);

    this.velocity_0.x = vx;
    this.velocity_0.y = vy;
    this.velocity_0.z = vz;
    if (vxm == SpeedMode.Extra && dvx) this.velocity_1.x = dvx
    if (vym == SpeedMode.Extra && dvy) this.velocity_1.y = dvy
    if (vzm == SpeedMode.Extra && dvz) this.velocity_1.z = dvz
    if (vxm == SpeedMode.Fixed) this.velocity_1.x = 0
    if (vym == SpeedMode.Fixed) this.velocity_1.y = 0
    if (vzm == SpeedMode.Fixed) this.velocity_1.z = 0
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
    this.dismiss_time = void 0;
    this.dismiss_data = void 0;
    this.fuse_bys = void 0
  }
  self_update(): void {
    if (this.fuse_bys?.length) {
      const { x, y, z } = this.position
      for (const fighter of this.fuse_bys) {
        fighter.position.set(x, y, z)
      }
      if (this.dismiss_time) this.dismiss_time--;
      const dismiss = (
        this.dismiss_time !== void 0 &&
        this.dismiss_time <= 0 ||
        this.ctrl.sametime_keys_test('dja') ||
        this.ctrl.sequence_keys_test('ja')
      ) && y == 0;
      if (dismiss) this.dismiss_fusion("112")
    }

    if (this.next_frame) this.enter_frame(this.next_frame);

    if (this._hp > 0 && this._hp < this._hp_r) {
      this._hp_r_tick.max = this.healing > 0 ?
        (this._data.base.hp_healing_ticks || this.world.hp_healing_ticks) :
        (this._data.base.hp_r_ticks || this.world.hp_r_ticks);
      if (this._hp_r_tick.add()) {
        const value = this.healing > 0 ?
          (this._data.base.hp_healing_value || this.world.hp_healing_value) :
          (this._data.base.hp_r_value || this.world.hp_r_value);
        this.hp = min(this._hp_r, this._hp + value);
        if (this._hp === this._hp_r) this.healing = 0;
        else if (this._healing) this.healing = max(0, this._healing - value)
      }
    }

    if (this._hp > 0 && this._mp < this._mp_max && !this._blinking_duration && !this._invisible_duration) {
      this._mp_r_tick.max = this._data.base.mp_r_ticks || this.world.mp_r_ticks;
      const r_ratio = this._data.base.mp_r_ratio || this.world.mp_r_ratio;
      if (this._mp_r_tick.add()) {
        const value = 1 + floor((500 - min(r_ratio * this._hp, 500)) / 100)
        this.mp = min(this._mp_max, this._mp + value);
      }
    }

    if (this.frame.hp) this.hp -= this.frame.hp;
    const { cpoint } = this.frame;
    if (cpoint) {
      if (cpoint?.decrease) {
        this._catch_time += cpoint.decrease;
        if (this._catch_time < 0) this._catch_time = 0;
      }
    } else {
      this._catch_time = this._catch_time_max;
    }
    if (this.shaking <= 0) {
      for (const [k, v] of this.v_rests) {
        if (v.attacker.shaking) continue;
        if (v.v_rest && v.v_rest >= 0) --v.v_rest;
        else this.v_rests.delete(k);
      }
    }
    for (const [k, v] of this.victims)
      if (v.v_rest) this.victims.delete(k)

    if (this.motionless <= 0 && this.shaking <= 0)
      this.a_rest >= 1 ? this.a_rest-- : (this.a_rest = 0);

    if (this._invisible_duration > 0) {
      this._invisible_duration--;
      if (this._invisible_duration <= 0) {
        this._blinking_duration = 120;
      }
    }
    if (this._invulnerable_duration > 0) {
      this._invulnerable_duration--;
    }
    if (this._blinking_duration > 0) {
      this._blinking_duration--;
      if (this._blinking_duration <= 0) {
        if (this._after_blink === Builtin_FrameId.Gone) {
          this.next_frame = void 0;
          this.frame = GONE_FRAME_INFO;
        } else if (this._after_blink === Builtin_FrameId.Respawn) {
          this.hp = this.hp_r = this.hp_max;
          this.position.y = 550;

          let max_distance = Number.MAX_SAFE_INTEGER
          let friend: Entity | undefined;
          for (const e of this.world.slot_fighters.values()) {
            if (e.hp <= 0) continue;
            const d =
              abs(floor(e.position.x - this.position.x)) +
              abs(floor(e.position.z - this.position.z));
            if (d > max_distance) continue;
            max_distance = d;
            friend = e;
          }
          if (friend) {
            this.position.x = this.lf2.random_in(
              max(floor(friend.position.x - 100), this.world.stage.player_l),
              min(floor(friend.position.x + 100), this.world.stage.player_r)
            )
            this.position.z = this.lf2.random_in(
              min(floor(friend.position.z - 100), this.world.stage.far),
              max(floor(friend.position.z + 100), this.world.stage.near)
            )
          }

          this.next_frame = Defines.NEXT_FRAME_AUTO;
        }
      }
    }

    this.follow_holder();
    if (this.holder) {
      const { wpoint } = this.holder.frame;
      if (wpoint) {
        const strength = this._data.base.strength || 1
        const weight = this._data.base.weight || 1
        let { dvx, dvy, dvz } = wpoint;
        if (dvx !== void 0 || dvy !== void 0 || dvz !== void 0) {
          const nf = this.find_align_frame(
            this.frame.id,
            this.data.indexes?.on_hands,
            this.data.indexes?.throwings
          )
          this.enter_frame(nf);

          const vz = this.holder.ctrl
            ? this.holder.ctrl.UD * (dvz || 0)
            : 0;

          dvx = strength * (dvx || 0) / weight;
          dvy = strength * (dvy || 0) / weight;
          const vx = (dvx - abs(vz / 2)) * this.facing;
          this.velocity_0.set(vx, dvy, vz);
          this.holder.holding = void 0;
          this.holder = void 0;
        }
      }
      if (this.hp <= 0 && this.holder) {
        this.holder.holding = void 0;
        this.holder = void 0;
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
  update_resting() {
    if (this.resting <= 0) {
      if (this.toughness_resting > 0) {
        this.toughness_resting--;
      } else if (this.toughness < this.toughness_max) {
        this.toughness += 1;
      }
    }
    if (this.resting > 0) {
      this.resting--;
    } else {
      if (this.fall_value < this.fall_value_max) {
        this.fall_value += 1;
      }
      if (this.defend_value < this.defend_value_max) {
        this.defend_value += 1;
      }
    }
  }

  /**
   * 持有物脱手
   *
   * @return {undefined}
   * @memberof Entity
   */
  drop_holding(): void {
    if (!this.holding) return;
    this.holding.follow_holder();
    this.holding.enter_frame({ id: this.lf2.random_get(this.holding.data.indexes?.in_the_skys) });
    this.holding.holder = void 0;
    this.holding = void 0;
  }

  update(): void {
    if (this.next_frame) this.enter_frame(this.next_frame);
    if (this.wait > 0) {
      --this.wait;
    } else {
      const nf = this.get_next_frame(this.frame.next);
      if (nf) this.next_frame = { ...nf.which, judger: void 0 }
      else this.next_frame = this.find_auto_frame()
    }
    this.handle_gravity();
    this.handle_frame_velocity();
    this.state?.update(this);
    let vx = 0;
    let vy = 0;
    let vz = 0;
    for (const v of this.velocities) {
      vx += v.x;
      vy += v.y;
      vz += v.z;
    }
    for (const [, v] of this.v_rests) {
      if (v.itr.kind === ItrKind.Block) {
        if (
          (vx < 0 && v.attacker.position.x < this.position.x) ||
          (vx > 0 && v.attacker.position.x > this.position.x)
        ) {
          vx = 0;
        }
        if (
          (vz < 0 && v.attacker.position.z < this.position.z) ||
          (vz > 0 && v.attacker.position.z > this.position.z)
        ) {
          vz = 0;
        }
      }
    }
    this.velocity.set(vx, vy, vz);
    if (!this.shaking && !this.motionless) {
      this.position.x = Number((this.position.x + vx).toFixed(4));
      this.position.y = Number((this.position.y + vy).toFixed(4));
      this.position.z = Number((this.position.z + vz).toFixed(4));
    }
    if (this.motionless > 0) {
      ++this.wait;
      --this.motionless;
    } else if (this.shaking > 0) {
      ++this.wait;
      --this.shaking;
    }
    const next_frame_1 = this.update_catching();
    const next_frame_2 = this.update_caught();
    this.next_frame = next_frame_2 || next_frame_1 || this.next_frame;

    if (this.ctrl) {
      const { next_frame, key_list } = this.ctrl.update();
      if (
        key_list === "dja" &&
        this.transform_datas &&
        this.transform_datas[1] === this._data &&
        this.position.y === 0
      ) {
        this.transfrom_to_another();
        this.ctrl.reset_key_list();
      } else if (next_frame) {
        const result = this.get_next_frame(next_frame)?.which;
        if (result) this.next_frame = result;
      }
    }

    // 落地
    if (this.velocity.y < 0 && this.position.y <= 0 && !this.shaking && !this.motionless) {

      if (this.frame.on_landing) {
        const result = this.get_next_frame(this.frame.on_landing);
        if (result) this.enter_frame(result.which);
      }

      this.position.y = 0;
      this.velocity_0.y = 0;
      this.state?.on_landing?.(this);
      this.play_sound(this._data.base.drop_sounds);

      if (this.throwinjury !== void 0) {
        this.hp -= this.throwinjury;
        this.hp_r -= round(this.throwinjury * (1 - this.world.hp_recoverability))
        this.throwinjury = void 0;
      }
      this._landing_frame = this.frame
    }

    this.world.restrict(this);
    this.holding?.follow_holder();
    this.collision_list.length = 0;
    this.collided_list.length = 0;
    this.update_id.add()
  }

  /**
   * hp意外归0时，应该去的地方
   * @returns
   */
  get_sudden_death_frame(): TNextFrame {
    return (
      this.state?.get_sudden_death_frame?.(this) || { id: Builtin_FrameId.Auto }
    );
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
    if (this.position.y < 1) this.position.y = 1;
    return (this.state?.get_caught_end_frame?.(this) || { id: Builtin_FrameId.Auto });
  }

  /**
   * 获取“被抓取消”帧
   *
   * 被抓后，抓人者的“抓取值”未降至0，且任意一方的帧缺少cpoint时，视为“被抓取消”，
   * 此时跳去的帧即为“被抓结束”帧
   *
   * @returns 下帧信息
   */
  get_caught_cancel_frame(): INextFrame {
    if (this.position.y < 1) this.position.y = 1;
    return { id: Builtin_FrameId.Auto };
  }

  private prev_cpoint_a?: ICpointInfo;
  update_caught(): INextFrame | undefined {
    const cer = this._catcher;
    if (!cer) return;
    /** "对齐颗粒度" */
    this.follow_catcher();
    if (!cer._catch_time) {
      delete this._catcher;
      this.prev_cpoint_a = void 0;
      return this.get_caught_end_frame();
    }

    const frame_a = cer.frame;
    const { cpoint: cpoint_a } = frame_a;
    const { cpoint: cpoint_b } = this.frame;
    if (!cpoint_a || !cpoint_b) {
      delete this._catcher;
      this.prev_cpoint_a = void 0;
      this.velocity_0.y = 3;
      return this.get_caught_cancel_frame();
    }
    if (this.prev_cpoint_a !== cpoint_a) {
      const { injury } = cpoint_a;
      if (injury) {
        this.hp -= injury;
        this.hp_r -= round(injury * (1 - this.world.hp_recoverability))
      }
      if (cpoint_a.shaking && cpoint_a.shaking > 0)
        this.shaking = cpoint_a.shaking;
    }
    this.prev_cpoint_a = cpoint_a;

    const { throwvx = 0, throwvy = 0, throwvz = 0, throwinjury = 0 } = cpoint_a;

    if (throwinjury > 0) this.throwinjury = throwinjury;
    if (throwvx || throwvy || throwvz) {
      this.velocity_0.z = throwvz * this.world.tvz_f * cer.ctrl.UD || 0;
      this.velocity_0.x = throwvx * this.world.tvx_f * cer.facing;
      this.velocity_0.y = throwvy * this.world.tvy_f;
      const { tx, ty, tz } = cpoint_a
      const w = this.frame.pic?.w || 0
      const h = this.frame.pic?.h || 0

      if (tx !== void 0)
        this.position.x = cer.position.x -
          cer.facing * (frame_a.centerx - tx) -
          this.facing * (this.frame.centerx - w / 2);

      if (ty !== void 0) this.position.y = cer.position.y + frame_a.centery - ty - h / 2;
      if (tz !== void 0) this.position.z = cer.position.z + tz;
      delete this._catcher;
      this.prev_cpoint_a = void 0;
    }
    if (cpoint_a.vaction) return this.get_next_frame(cpoint_a.vaction)?.which;
  }

  update_catching(): INextFrame | undefined {
    if (!this._catching) return;

    if (!this._catch_time) {
      delete this._catching;
      return this.get_catching_end_frame();
    }

    const { cpoint: cpoint_a } = this.frame;
    const { cpoint: cpoint_b } = this._catching.frame;
    if (!cpoint_a || !cpoint_b) {
      delete this._catching;
      return this.get_catching_cancel_frame();
    }

    const { throwvx, throwvy, throwvz, throwinjury } = cpoint_a;
    if (throwinjury !== void 0) {
      if (throwinjury > 0) {
        // TODO：丢出后，被丢的人落地后的受到的伤害
        // return;
      } else if (throwinjury === -1) {
        // TODO：变成抓住的人
        if (is_character(this) && is_character(this._catching)) {
          this.transfrom_to_another(this._catching._data);
          return this.find_auto_frame();
        }
      } else {
        return GONE_FRAME_INFO;
      }
    }
    if (throwvx || throwvy || throwvz) {
      delete this._catching;
      return void 0;
    }

    /** "对齐颗粒度" */
    this.follow_catcher();
  }

  follow_catcher() {
    if (!this._catcher) return;
    const {
      centerx: centerx_a,
      centery: centery_a,
      cpoint: c_a,
    } = this._catcher.frame;
    const { centerx: centerx_b, centery: centery_b, cpoint: c_b } = this.frame;
    if (!c_a || !c_b) return;
    if (c_a.throwvx || c_a.throwvx || c_a.throwvx) return;

    const face_a = this._catcher.facing;
    const face_b = this.facing;
    const { x: px, y: py, z: pz } = this._catcher.position;
    this.position.x =
      px - face_a * (centerx_a - c_a.x) + face_b * (centerx_b - c_b.x);
    this.position.y = round(py + centery_a - c_a.y + c_b.y - centery_b);
    this.position.z = round(pz + c_a.z - c_b.z);
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
    if (this.doppelgangers.size) {
      const gones = []
      for (const d of this.doppelgangers) {
        if (!d.is_attach) gones.push(d)
        else d.transform(next_data)
      }
      for (const d of gones) {
        this.doppelgangers.delete(d)
      }
    }


  }

  /**
   * 最近一次攻击信息
   *
   * @type {ICollision}
   * @memberof Entity
   */
  lastest_collision?: ICollision;

  /**
   * 最近一次被攻击信息
   *
   * @type {ICollision}
   * @memberof Entity
   */
  lastest_collided?: ICollision;

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
  start_catch(target: Entity, itr: IItrInfo) {
    this.debug(`start_catch`)
    if (itr.catchingact === void 0) {
      this.warn(`start_catch`, `cannot catch, catchingact got ${itr.catchingact}`);
      return;
    }
    this._catch_time = this._catch_time_max;
    this._catching = target;
    this.next_frame = this.get_next_frame(itr.catchingact)?.which;
  }

  start_caught(attacker: Entity, itr: IItrInfo) {
    this.debug(`start_caught`)
    if (itr.caughtact === void 0) {
      this.warn(`start_caught`, `cannot be caught, caughtact got ${itr.caughtact}`)
      return;
    }
    this._catcher = attacker;
    this.resting = 0;
    this.fall_value = this.fall_value_max;
    this.defend_value = this.defend_value_max;
    this.next_frame = this.get_next_frame(itr.caughtact)?.which;
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
    const x = this.lf2.random_in(l, r);
    const y = 2 + (b + t) / 2//this.lf2.random_in(b, t);
    const z = max(f, n) + 2;
    return [x, y, z] as const;
  }

  dizzy_catch_test(target: Entity): boolean {
    return (
      is_character(this) &&
      is_character(target) && target.frame.state === StateEnum.Tired &&
      ((this.velocity_0.x > 0 && target.position.x > this.position.x) ||
        (this.velocity_0.x < 0 && target.position.x < this.position.x))
    );
  }

  dispose(): void {
    this._is_attach = false;
    this.world.del_entity(this);
    this.ctrl.dispose();
    this._callbacks.emit("on_disposed")(this);
    this._callbacks.clear()
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


  is_ally(other: Entity): boolean {
    return this.team === other.team;
  }

  follow_holder() {
    const holder = this.holder;
    if (!holder) return;
    const {
      wpoint: wp_a,
      centerx: centerx_a,
      centery: centery_a,
    } = holder.frame;
    if (!wp_a) this.debug(`follow_holder`, `failed! holder.frame.wpoint got ${wp_a}`)
    if (!wp_a) return;

    if (wp_a.weaponact !== this.frame.id) {
      this.enter_frame({ id: wp_a.weaponact });
    }
    const {
      wpoint: wp_b,
      centerx: centerx_b,
      centery: centery_b,
    } = this.frame;
    if (!wp_b) this.debug(`follow_holder`, `failed! this.frame.wpoint got ${wp_b}`)
    if (!wp_b) return;

    const { x, y, z } = holder.position;
    this.facing = holder.facing;
    this.position.set(
      round(x + this.facing * (wp_a.x - centerx_a + centerx_b - wp_b.x)),
      round(y + centery_a - wp_a.y - centery_b + wp_b.y),
      round(z + wp_a.z - wp_b.z),
    );
  }

  protected _chasing?: Entity;
  get chasing(): Entity | undefined { return this._chasing; }
  set chasing(e: Entity | undefined) { this._chasing = e; }


  enter_frame(which: TNextFrame): void {
    if (this.frame.id === Builtin_FrameId.Gone)
      return;

    const result = this.get_next_frame(which);
    if (!result) {
      this.next_frame = void 0;
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
        let { x, y, z } = this.position;
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

    this.next_frame = void 0;
    if (flags.id === Builtin_FrameId.Auto) {
      this.a_rest = 0;
      for (const [_, v] of this.victims)
        v.v_rest = 0;
      this.victims.clear()
    }
    this.v_rests

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
      default:
        return this.facing;
    }
  }

  get_next_frame(which: TNextFrame): INextFrameResult | undefined {
    if (Array.isArray(which)) {
      const l = which.length;
      for (let i = 0; i < l; ++i) {
        const nf: INextFrame | undefined = which[i];
        if (!nf) continue;
        const f = this.get_next_frame(nf);
        if (f) return f;
      }
      return void 0;
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
      frame = this.find_frame_by_id(this.lf2.random_get(id));
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

  merge_velocities() {
    if (this.velocities.length <= 1) return;
    let vx = 0;
    let vy = 0;
    let vz = 0;
    for (const v of this.velocities) {
      vx += v.x;
      vy += v.y;
      vz += v.z;
    }
    this.velocities.length = 1;
    this.velocity_0.set(vx, vy, vz);
  }

  transform(data: IEntityData) {
    if (!is_local_ctrl(this.ctrl))
      this.ctrl = Factory.inst.get_ctrl(data.id, this.ctrl.player_id, this);
    const prev = this._data;
    this._data = data;
    const { armor } = this._data.base
    if (this.armor = armor) {
      this.toughness = this.toughness_max = armor.toughness
    } else {
      this.armor = void 0;
      this.toughness =
        this.toughness_max =
        this.toughness_resting =
        this.toughness_resting_max = 0;
    }
    this._callbacks.emit("on_data_changed")(this._data, prev, this)
  }
}

Factory.inst.set_entity_creator(
  EntityEnum.Ball,
  (...args) => new Entity(...args),
);
Factory.inst.set_entity_creator(
  EntityEnum.Weapon,
  (...args) => new Entity(...args),
);
Factory.inst.set_entity_creator(
  EntityEnum.Entity,
  (...args) => new Entity(...args),
);
Factory.inst.set_entity_creator(
  EntityEnum.Fighter,
  (...args) => new Entity(...args),
);