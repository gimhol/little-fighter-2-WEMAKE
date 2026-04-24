import FSM from "../base/FSM";
import { BaseController } from "../controller/BaseController";
import {
  AGK,
  ATTCKING_ITR_KINDS,
  ATTCKING_STATES,
  BotDataSet,
  BotStateEnum,
  Defines as D,
  Difficulty,
  GK,
  IBotAction, IBotData, IBotDataSet,
  IVector3,
  LGK, StateEnum,
  W_T
} from "../defines";
import { Ditto } from "../ditto";
import { Entity, is_ball, is_fighter, is_weapon } from "../entity";
import { manhattan_xz } from "../helper/manhattan_xz";
import { abs, between, clamp, max, round, round_float } from "../utils";
import { DummyEnum, dummy_updaters } from "./DummyEnum";
import { NearestTargets } from "./NearestTargets";
import { BotState_Avoiding, BotState_Chasing, BotState_Idle } from "./state";
import { BotState_Following } from "./state/BotState_Following";
import { BotState_StageEnd } from "./state/BotState_StageEnd";
import { is_ray_hit } from "./utils/is_ray_hit";

export enum BotBehavior {
  Stay = 'stay',
  Move = 'move',
}
export class BotController extends BaseController {
  readonly fsm = new FSM<BotStateEnum>()
    .add(
      new BotState_Idle(this),
      new BotState_Chasing(this),
      new BotState_Avoiding(this),
      new BotState_Following(this),
      new BotState_StageEnd(this)
    )
    .use(BotStateEnum.Idle)

  readonly __is_bot_ctrl__ = true;

  protected _behavior: BotBehavior = BotBehavior.Move;
  protected _goingto?: IVector3;
  en_out_of_range: boolean = false;
  protected _bot_id: string | undefined;
  protected _bot: IBotData | undefined;
  protected _dataset: Required<IBotDataSet>;

  get dataset() { return this._dataset }
  get behavior(): BotBehavior { return this._behavior }
  get goingto(): IVector3 | undefined { return this._goingto }

  /** 走攻触发范围X */
  get w_atk_x() {
    const en = this.chasings.get()?.entity;
    if (!en) return 0;
    if (is_weapon(en)) return 40;

    const wt = this.entity.holding?.base_type
    if (
      wt === W_T.Baseball ||
      wt === W_T.Drink
    ) return 800 * this.entity.strength;
    if (
      wt === W_T.Stick ||
      wt === W_T.Knife
    ) return 90;
    if (
      wt === W_T.Heavy
    ) return 200 * this.entity.strength;
    return this.dataset.w_atk_x
  }
  /** 跑攻触发范围X */
  get r_atk_x() {
    const en = this.chasings.get()?.entity;
    if (!en) return 0;
    const wt = this.entity.holding?.base_type
    if (
      wt === W_T.Baseball ||
      wt === W_T.Drink
    ) return 800 * this.entity.strength;
    if (
      wt === W_T.Heavy
    ) return 200 * this.entity.strength;

    if (
      wt === W_T.Stick ||
      wt === W_T.Knife
    ) return 100;
    return this.dataset.r_atk_x;
  }
  /** 冲跳攻触发范围X */
  get d_atk_x() {
    const chasing = this.chasings.get()?.entity;
    if (!chasing) return 0;
    const wt = this.entity.holding?.base_type;
    const sp = this.entity.facing * this.entity.velocity.x * 8
    if (
      wt === W_T.Baseball ||
      wt === W_T.Drink
    ) return sp + 100 * this.entity.strength;
    if (
      wt === W_T.Stick ||
      wt === W_T.Knife
    ) return 100;
    return sp + this.dataset.d_atk_x;
  }
  /** 跳攻触发范围X */
  get j_atk_x() {
    const chasing = this.chasings.get()?.entity;
    if (!chasing) return 0;
    const wt = this.entity.holding?.base_type;
    const sp = this.entity.facing * this.entity.velocity.x * 8
    if (
      wt === W_T.Baseball ||
      wt === W_T.Drink
    ) return sp * 200 * this.entity.strength;
    if (
      wt === W_T.Stick ||
      wt === W_T.Knife
    ) return sp * 110;
    return sp * this.dataset.j_atk_x;
  }
  /** 最近站立攻击距离 */
  get atk_m_x() {
    const wt = this.entity.holding?.base_type
    if (
      wt === W_T.Baseball ||
      wt === W_T.Drink
    ) return 100;
    return this.dataset.w_atk_m_x
  }

  get stage() { return this.world.stage }
  get r_desire(): -1 | 1 | 0 {
    const chasing = this.chasings.get()?.entity;
    this.desire(`${chasing?.id ?? 'no chasing'}`)
    if (!chasing) return 0;
    let dx = abs(this.entity.position.x - chasing.position.x) - this.dataset.r_x_min
    // if (dx < 0) return 0;
    let should_run = false
    const r_x_r = this.dataset.r_x_max - this.dataset.r_x_min
    if (r_x_r === 0) {
      dx = round(clamp(dx, 0, r_x_r) / r_x_r)
      const min = this.dataset.r_desire_min + (this.dataset.r_desire_max - this.dataset.r_desire_min) * dx
      should_run = this.desire(`rr1`) < min;
    } else {
      should_run = this.desire(`rr2 ${dx}`) < this.dataset.r_x_min;
    }
    if (dx < 0) should_run = false
    if (!should_run) return 0;
    return this.entity.position.x > chasing.position.x ? -1 : 1
  }


  /** 追击对象 */
  readonly chasings = new NearestTargets(D.AI_MAX_CHASINGS_ENEMIES);

  /** 躲避对象 */
  readonly avoidings = new NearestTargets(D.AI_MAX_AVOIDING_ENEMIES);

  /** 防御对象  */
  readonly defends = new NearestTargets(D.AI_MAX_DEFENDS_ENEMIES);

  protected _dummy: DummyEnum = DummyEnum.None;

  get dummy(): DummyEnum {
    return this._dummy;
  }
  set dummy(v) {
    this.key_up(...Object.values(GK));
    this._dummy = v;
  }
  constructor(player_id: string, entity: Entity) {
    super(player_id, entity);
    this._dataset = new BotDataSet();
  }

  /**
   * 判断是否应该追击某个对象
   *
   * @param {(Entity | null)} [e]
   * @return {*}  {boolean}
   * @memberof BotController
   */
  should_chase(e?: Entity | null): boolean {
    const { entity: me } = this;
    const e_state = e?.state;

    if (me.hp <= 0)
      return false;
    if (me.holding?.base_type == W_T.Drink)
      return false;
    if (!e?.is_attach || e.hp <= 0)
      return false;

    const [l, r] = this.world.fighter_bound(me)
    if (!between(e.position.x, l, r))
      return false;

    const abs_dx = abs(me.position.x - e.position.x)
    if (is_weapon(e)) {
      if (me.holding)
        return false;

      do {
        // 队友Bot尽量不喝
        if (this.stage.id === D.VOID_STAGE.id)
          break; // 非闯关
        if (e.base_type !== W_T.Drink)
          break; // 非饮料
        if (me.team == this.stage.team)
          break; // 敌人角色
        if (!e.data.base.drink?.hp_h_total)
          return false; // 不补血的不喝
        if (me.hp >= round_float(2 * me.hp_max / 3))
          return false; // 血多的不喝
        if (!this.world.has_players_alive)
          break; // “大将”已死，挣扎之
        if (this.behavior != BotBehavior.Stay)
          return false; // 仅在Stay喝
        if (abs_dx > 100)
          return false; // 不喝太远的
      } while (0);

      if (e_state == StateEnum.Weapon_OnGround)
        return true;
      if (e_state == StateEnum.HeavyWeapon_OnGround)
        return true
      return false;
    }
    if (e_state == StateEnum.Lying)
      return false;
    if (e.invisible) return false
    if (e.blinking) return false
    if (e.invulnerable) return false
    if (me.ground_y == me.position.y) return true
    if (this.fsm.state?.key === BotStateEnum.Chasing) {
      return this.atk_m_x <= abs_dx
    } else if (this.fsm.state?.key === BotStateEnum.Avoiding) {
      return this.dataset.w_atk_r_x > abs(me.position.x - e.position.x)
    }
    return false
  }

  /**
   * 判断是否应该躲避某个对象
   *
   * @param {(Entity | null)} [e]
   * @return {*}  {boolean}
   * @memberof BotController
   */
  should_avoid(e?: Entity | null): boolean {
    const { entity: me } = this;
    if (
      me.hp <= 0 ||
      !e?.is_attach ||
      e.hp <= 0
    ) return false;

    const dxz = manhattan_xz(this.entity, e)
    if (e.state === StateEnum.Lying) return dxz < 180;
    if (e.blinking) return dxz < 180;
    if (e.invulnerable) return dxz < 180;
    if (me.holding?.base_type === W_T.Drink) return dxz < 180;

    // 不再地上
    if (me.ground_y != me.position.y) return false;

    if (
      e.state == StateEnum.BrokenDefend ||
      e.state == StateEnum.Caught ||
      e.state == StateEnum.Falling ||
      e.state == StateEnum.Drink ||
      e.state == StateEnum.Frozen
    ) return false

    if (this.fsm.state?.key === BotStateEnum.Chasing) {
      return this.atk_m_x > abs(me.position.x - e.position.x)
    } else if (this.fsm.state?.key === BotStateEnum.Avoiding && this.dataset.w_atk_r_x > 0) {
      return this.dataset.w_atk_r_x < abs(me.position.x - e.position.x)
    }
    return false
  }


  /**
   * 判断是否应该防御某个对象
   *
   * @param {(Entity | null)} [e]
   * @return {0|1|2} 
   *    无需防御时，返回0; 
   *    需要防御时，返回1；
   *    威胁无法防御时，返回2；
   * @memberof BotController
   */
  should_defend(e?: Entity | null): 0 | 1 | 2 {
    if (
      e?.is_attach != true ||
      e.invisible ||
      this.entity.toughness ||
      this.entity.invisible ||
      this.entity.blinking ||
      this.entity.invulnerable) return 0

    const { itr: itrs } = e
    do {
      if (is_ball(e))
        break;

      const { state } = e.frame
      if (is_weapon(e)) {
        if (StateEnum.HeavyWeapon_InTheSky == state)
          break;
        if (StateEnum.Weapon_Throwing == state)
          break;
        if (StateEnum.Weapon_OnHand == state && e.bearer?.frame.wpoint?.attacking)
          break;
        return 0;
      }

      if (is_fighter(e)) {
        if (!ATTCKING_STATES.some(v => v === state))
          return 0
        if (e.fall_value < e.fall_value_max)
          break;
        if (e.defend_value < e.defend_value_max)
          break;
      }
      return 0;
    } while (0);


    const hit = is_ray_hit(e, this.entity, {
      x: max(e.velocity.x, 1),
      z: e.velocity.z,
      min_x: -20,
      max_x: max(abs(10 * e.velocity.x), 60),
      min_z: -2 * D.DAFUALT_QUBE_LENGTH,
      max_z: max(abs(10 * e.velocity.z), 2 * D.DAFUALT_QUBE_LENGTH)
    })
    if (!hit) return 0;

    if (itrs?.length) {
      let has_atk_itr_kind = false;
      let just_a_rest = true
      for (const itr of itrs) {
        if (!ATTCKING_ITR_KINDS.some(v => itr.kind === v)) continue;
        has_atk_itr_kind = true;
        if (D.DEFAULT_FORCE_BREAK_DEFEND_VALUE === itr.bdefend) {
          return 2;
        }
        if (itr.vrest) just_a_rest = false
      }
      if (!has_atk_itr_kind) return 0;
      if (just_a_rest && e.arest) return 0;
    }
    return 1;
  }

  look_other(other: Entity) {
    if (is_fighter(other)) {
      if (this.entity.is_ally(other)) {
        return;
      }
      if (this.should_avoid(other)) {
        this.avoidings.look(this.entity, other)
        return;
      }
      const dd = this.should_defend(other)
      if (dd) {
        this.defends.look(this.entity, other, dd)
        return;
      }
      if (this.should_chase(other)) {
        this.chasings.look(this.entity, other)
        return;
      }
    } else if (is_weapon(other)) {
      if (this.should_chase(other)) {
        this.chasings.look(this.entity, other)
        return;
      }
      if (this.entity.is_ally(other)) {
        return;
      }
      const dd = this.should_defend(other)
      if (dd) {
        this.defends.look(this.entity, other, dd)
        return;
      }
    } else if (is_ball(other)) {
      if (this.entity.is_ally(other)) {
        return;
      }
      const dd = this.should_defend(other)
      if (dd) {
        this.defends.look(this.entity, other, dd)
        return;
      }
    }
  }

  /**
   *  预判敌人位置(有点粗暴)
   */
  guess_entity_pos(entity: Entity) {
    const { x: px, z: pz, y: py } = entity.position;
    const { x: vx, z: vz, y: vy } = entity.velocity;
    let x = 0;
    let z = 0;
    let y = 0;
    switch (entity.state) {
      case StateEnum.Jump:
        x = round_float(px + 3 * vx);
        z = round_float(pz + 2 * vz);
        y = round_float(py + 2 * vy);
        break;
      case StateEnum.Running:
        x = round_float(px + 4 * vx);
        z = round_float(pz + 2.5 * vz);
        y = round_float(py + 2.5 * vy);
        break;
      case StateEnum.Dash:
        x = round_float(px + 5 * vx);
        z = round_float(pz + 3 * vz);
        y = round_float(py + 3 * vy)
        break;
      default:
        x = round_float(px + vx);
        z = round_float(pz + vz);
        y = round_float(py + vy)
        break;
    }
    return { x: px, z: pz, next_x: x, next_z: z, next_y: y };
  }

  /** 
   * 获取随机值, 范围: 0~10000
   * 
   * 设计上，此值应该越小越容易触发动作，
   * 但具体还是需要看使用地方的代码是怎么写的
   * 
   * usage:
   * 
   * if this.desire() < this.jump_desire: 
   *    jump!
   */
  desire(mark: string) {
    this.lf2.mt.mark = mark
    return this.lf2.mt.range(0, D.MAX_AI_DESIRE)
  }

  action_desire(mark: string): number {
    let ret = this.desire(mark); // 默认action设置的desire是crazy的好了。
    for (let i = Difficulty.MAX - this.world.difficulty; i > 0; --i) {
      this.lf2.mt.mark = mark;
      ret += this.lf2.mt.range(0, ret);
    }
    return ret;
  }
  check_bot(): void {
    const { bot, bot_id } = this.entity.data.base;
    if (bot && bot === this._bot) return
    if (bot && bot !== this._bot) {
      Object.assign(this.dataset, BotDataSet.Default, bot.dataset)
      this._bot = bot;
      this._bot_id = void 0;
      return;
    }
    if (this._bot_id === bot_id) return
    this._bot_id = bot_id;
    Object.assign(this.dataset, BotDataSet.Default)
    if (!bot_id) return this._bot = void 0;
    this._bot = this.lf2.datas.find_bot(bot_id)
    Object.assign(this.dataset, this._bot?.dataset)
  }
  override update() {
    this.check_bot();
    if (this.dummy) {
      dummy_updaters[this.dummy]?.update(this);
    } else if (this.world.stage.is_chapter_finish) {
      this.key_up(...AGK)
    } else if (this.entity.hp <= 0) {
      this.key_up(...AGK)
    } else {
      this.chasings.del(({ entity }) => !this.should_chase(entity))
      this.chasings.sort(this.entity)
      this.avoidings.del(({ entity }) => !this.should_avoid(entity))
      this.avoidings.sort(this.entity)
      this.defends.del(({ entity }) => 1 != this.should_defend(entity))
      this.defends.sort(this.entity)
      this.fsm.update(1)
    }
    return super.update();
  }
  lock_when_stand_and_rest() {
    if (
      this.entity.state === StateEnum.Standing &&
      this.entity.resting <= 0
    ) {
      this.entity.set_position(
        this.world.bg.width / 2,
        null,
        (this.world.bg.near + this.world.far) / 2
      )
      return true;
    }
    return false;
  }


  handle_action(action: IBotAction | undefined): LGK[] | false {
    if (!action) return false
    const { facing } = this.entity;
    const { status, e_ray, judger, desire, keys } = action;
    const action_desire = this.action_desire(action.keys.join());
    if (!desire || action_desire > desire) return false;
    if (status && !status.some(v => v === this.fsm.state?.key))
      return false;
    if (e_ray) {
      const chasing = this.chasings.get()?.entity;
      if (!chasing || !is_fighter(chasing)) return false;
      let ray_hit = false
      for (const r of e_ray) {
        ray_hit = is_ray_hit(this.entity, chasing, r);
        if (ray_hit) break;
      }
      if (!ray_hit) return false;
    }

    if (judger && !judger.run(this))
      return false;
    const ks = keys.map<LGK>(v => {
      if (v === 'F') return facing > 0 ? GK.R : GK.L;
      if (v === 'B') return facing > 0 ? GK.R : GK.L;
      return v
    })
    return ks;
  }

  move(): void {
    this._behavior = BotBehavior.Move
  }
  stay(): void {
    this._behavior = BotBehavior.Stay
  }
  goto(x: number, y: number, z: number): void {
    this._goingto = new Ditto.Vector3(x, y, z)
  }
  stop(): void {
    this._goingto = void 0;
  }
}
