import FSM from "../base/FSM";
import { BaseController, CONFLICTS_KEY_MAP, KEY_NAME_LIST } from "../controller/BaseController";
import {
  ATTCKING_ITR_KINDS,
  ATTCKING_STATES,
  BotStateEnum,
  Defines,
  Difficulty,
  GK,
  IBotAction, IBotDataSet,
  LGK, StateEnum
} from "../defines";
import { Entity, is_ball, is_fighter, is_weapon } from "../entity";
import { manhattan_xz } from "../helper/manhattan_xz";
import { PlayerInfo } from "../PlayerInfo";
import { abs, clamp, max, round } from "../utils";
import { DummyEnum, dummy_updaters } from "./DummyEnum";
import { IBotTarget } from "./IBotTarget";
import { NearestTargets } from "./NearestTargets";
import { BotState_Avoiding, BotState_Chasing, BotState_Idle } from "./state";
import { BotState_Following } from "./state/BotState_Following";
import { is_ray_hit } from "./utils/is_ray_hit";

export class BotController extends BaseController implements Required<IBotDataSet> {

  readonly player: PlayerInfo | undefined;
  readonly fsm = new FSM<BotStateEnum>()
    .add(
      new BotState_Idle(this),
      new BotState_Chasing(this),
      new BotState_Avoiding(this),
      new BotState_Following(this)
    )
    .use(BotStateEnum.Idle)

  readonly __is_bot_ctrl__ = true;

  /** 走攻触发范围X(敌人正对) */
  w_atk_f_x = Defines.AI_W_ATK_F_X;
  /** 走攻触发范围X(敌人背对) */
  w_atk_b_x = Defines.AI_W_ATK_B_X;
  /** 走攻盲区 */
  w_atk_m_x = Defines.AI_W_ATK_M_X;

  /** 走攻触发范围Z */
  w_atk_z = Defines.AI_W_ATK_Z;
  data_set: IBotDataSet | undefined;
  behavior?: 'stay' | 'move';
  following?: [number, number, number];
  en_out_of_range: boolean = false;
  /** 走攻触发范围X */
  get w_atk_x() {
    const chasing = this.get_chasing()?.entity;
    if (!chasing) return 0;
    return this.entity.facing === chasing.facing ?
      this.w_atk_f_x :
      this.w_atk_b_x;
  }


  /** 跑攻欲望值 */
  r_atk_desire = Defines.AI_R_ATK_DESIRE;
  /** 跑攻触发范围X(敌人正对) */
  r_atk_f_x = Defines.AI_R_ATK_F_X;
  /** 跑攻触发范围X(敌人背对) */
  r_atk_b_x = Defines.AI_R_ATK_F_X;
  /** 跑攻触发范围Z */
  r_atk_z = Defines.AI_R_ATK_Z;
  /** 跑攻触发范围X */
  get r_atk_x() {
    const chasing = this.get_chasing()?.entity;
    if (!chasing) return 0;
    return this.entity.facing === chasing.facing ? this.r_atk_b_x : this.r_atk_f_x;
  }

  /** 冲跳攻触发范围X(敌人正对) */
  d_atk_f_x = Defines.AI_D_ATK_F_X;
  /** 冲跳攻触发范围X(敌人正对) */
  d_atk_b_x = Defines.AI_D_ATK_B_X;
  /** 冲跳攻触发范围Z */
  d_atk_z = Defines.AI_D_ATK_Z;
  /** 冲跳攻触发范围X */
  get d_atk_x() {
    const chasing = this.get_chasing()?.entity;
    if (!chasing) return 0;
    return this.entity.facing === chasing.facing ? this.d_atk_b_x : this.d_atk_f_x;
  }

  /** 跳攻触发范围X(敌人正对) */
  j_atk_f_x = Defines.AI_J_ATK_F_X;
  /** 跳攻触发范围X(敌人正对) */
  j_atk_b_x = Defines.AI_J_ATK_B_X;
  /** 跳攻触发范围Z */
  j_atk_z = Defines.AI_J_ATK_Z;
  /** 跳攻触发范围Y */
  j_atk_y_min = Defines.AI_J_ATK_Y_MIN;
  j_atk_y_max = Defines.AI_J_ATK_Y_MAX;
  /** 跳攻触发范围X */
  get j_atk_x() {
    const chasing = this.get_chasing()?.entity;
    if (!chasing) return 0;
    return this.entity.facing === chasing.facing ? this.j_atk_b_x : this.j_atk_f_x;
  }

  jump_desire = Defines.AI_J_DESIRE;
  dash_desire = Defines.AI_D_DESIRE;

  /** 最小欲望值：跑步 */
  r_desire_min = Defines.AI_R_DESIRE_MIN;

  /** 最大欲望值：跑步 */
  r_desire_max = Defines.AI_R_DESIRE_MAX;

  /** 
   * 最小起跑范围X 
   * 距离敌人小于于等于此距离时，此时奔跑欲望值最小
   */
  r_x_min = Defines.AI_R_X_MIN;

  /** 
   * 最大起跑范围X 
   * 距离敌人大于等于此距离时，此时奔跑欲望值最大
   */
  r_x_max = Defines.AI_R_X_MAX;

  get r_desire(): -1 | 1 | 0 {
    const chasing = this.get_chasing()?.entity;
    if (!chasing) return 0;
    let dx = abs(this.entity.position.x - chasing.position.x) - this.r_x_min
    // if (dx < 0) return 0;
    let should_run = false
    const r_x_r = this.r_x_max - this.r_x_min
    if (r_x_r === 0) {
      dx = round(clamp(dx, 0, r_x_r) / r_x_r)
      const min = this.r_desire_min + (this.r_desire_max - this.r_desire_min) * dx
      should_run = this.desire(`rr1`) < min;
    } else {
      should_run = this.desire(`rr2 ${dx}`) < this.r_x_min;
    }
    if (dx < 0) should_run = false
    if (!should_run) return 0;
    return this.entity.position.x > chasing.position.x ? -1 : 1
  }

  /** 欲望值：停止跑步 */
  r_stop_desire = Defines.AI_R_STOP_DESIRE;

  /** 防御 */
  d_desire = Defines.AI_DEF_DESIRE;

  get_chasing(): IBotTarget | undefined {
    return this.chasings.get()
  }

  get_avoiding(): IBotTarget | undefined {
    return this.avoidings.get()
  }

  chasings = new NearestTargets(Defines.AI_MAX_CHASINGS_ENEMIES);
  avoidings = new NearestTargets(Defines.AI_MAX_AVOIDING_ENEMIES);
  defends = new NearestTargets(Defines.AI_MAX_DEFENDS_ENEMIES);
  private _dummy?: DummyEnum;
  get dummy(): DummyEnum | undefined {
    return this._dummy;
  }
  set dummy(v) {
    this.end(...Object.values(GK));
    this._dummy = v;
  }
  constructor(player_id: string, entity: Entity) {
    super(player_id, entity);
    this.player = this.lf2.players.get(player_id)
  }
  manhattan_to(a: Entity) {
    const { x, z } = this.entity.position;
    const { x: x1, z: z1 } = a.position;
    return abs(x1 - x) + abs(z1 - z);
  }

  /**
   * 判断是否应该追击某个对象
   *
   * @param {(Entity | null)} [e]
   * @return {*}  {boolean}
   * @memberof BotController
   */
  should_chase(e?: Entity | null): boolean {
    return !!(
      this.entity.hp > 0 &&
      e?.is_attach &&
      e.hp > 0 &&
      e.frame.state !== StateEnum.Lying &&
      !e.invisible &&
      !e.blinking &&
      !e.invulnerable
    )
  }

  /**
   * 判断是否应该躲避某个对象
   *
   * @param {(Entity | null)} [e]
   * @return {*}  {boolean}
   * @memberof BotController
   */
  should_avoid(e?: Entity | null): boolean {
    if (
      this.entity.hp <= 0 ||
      !e?.is_attach ||
      e.hp <= 0
    ) return false;

    const dxz = manhattan_xz(this.entity, e)
    return !!(
      dxz < 300 && (
        e.frame.state === StateEnum.Lying ||
        e.invisible ||
        e.blinking ||
        e.invulnerable ||
        !e.frame.bdy?.length
      )
    )
  }


  /**
   * 判断是否应该防御某个对象
   *
   * @param {(Entity | null)} [e]
   * @return {*}  {boolean}
   * @memberof BotController
   */
  should_defend(e?: Entity | null): 0 | 1 | 2 {
    if (
      e?.is_attach != true ||
      this.entity.toughness ||
      this.entity.invisible ||
      this.entity.blinking ||
      this.entity.invulnerable) return 0

    const { itr: itrs } = e
    if (!ATTCKING_STATES.some(v => v === e.frame.state))
      return 0

    const hit = is_ray_hit(e, this.entity, {
      x: max(e.velocity.x, 1),
      z: e.velocity.z,
      min_x: -80,
      max_x: max(abs(10 * e.velocity.x), 60),
      min_z: -2 * Defines.DAFUALT_QUBE_LENGTH,
      max_z: max(abs(10 * e.velocity.z), 2 * Defines.DAFUALT_QUBE_LENGTH)
    })
    if (!hit) return 0;

    if (itrs?.length) {
      let has_atk_itr_kind = false;
      let just_a_rest = true
      for (const itr of itrs) {
        if (!ATTCKING_ITR_KINDS.some(v => itr.kind === v)) continue;
        has_atk_itr_kind = true;
        if (Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE === itr.bdefend) {
          return 2;
        }
        if (itr.vrest) just_a_rest = false
      }
      if (!has_atk_itr_kind) return 0;
      if (just_a_rest && e.a_rest) return 0;
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

    } else if (is_ball(other) || is_weapon(other)) {
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
    let x = px + vx;
    let z = pz + vz;
    let y = py + vy;
    switch (entity.frame.state) {
      case StateEnum.Jump:
        x += 2 * vx;
        z += 1 * vz;
        y += 1 * vy;
        break;
      case StateEnum.Running:
        x += 3 * vx;
        z += 1.5 * vz;
        y += 1.5 * vy;
        break;
      case StateEnum.Dash:
        x += 4 * vx;
        z += 2 * vz;
        y += 2 * vy
        break;
    }
    return { x: px, z: pz, next_x: x, next_z: z, next_y: y };
  }

  key_up(...ks: LGK[]): this {
    for (const k of ks) if (!this.is_end(k)) this.end(k)
    return this;
  }
  key_down(...ks: LGK[]): this {
    for (const k of ks) if (this.is_end(k)) this.start(k)
    return this;
  }
  fast_click(...ks: LGK[]): this {
    for (const k of ks) {
      this.key_down(k).key_up(k)
      const ck = CONFLICTS_KEY_MAP[k]
      if (ck) this.key_up(ck)
    }
    return this;
  }
  keep_press(...ks: LGK[]): this {
    for (const k of ks) {
      this.key_down(k)
      const ck = CONFLICTS_KEY_MAP[k]
      if (ck) this.key_up(ck)
    }
    return this;
  }
  desire(mark: string) {
    this.lf2.mt.mark = mark
    return this.lf2.mt.range(0, Defines.MAX_AI_DESIRE)
  }

  override update() {
    if (this.data_set !== this.entity.data.base.bot?.dataset) {
      this.data_set = this.entity.data.base.bot?.dataset
      Object.assign(this, this.entity.data.base.bot?.dataset)
    }
    if (this.dummy) {
      dummy_updaters[this.dummy]?.update(this);
    } else if (this.world.stage.is_chapter_finish) {
      this.key_up(...KEY_NAME_LIST)
    } else if (this.entity.hp <= 0) {
      this.key_up(...KEY_NAME_LIST)
    } else {
      this.chasings.del(({ entity }) => !this.should_chase(entity))
      this.chasings.sort(this.entity)

      this.avoidings.del(({ entity }) => !this.should_avoid(entity))
      this.avoidings.sort(this.entity)

      this.defends.del(({ entity }) => !this.should_defend(entity))
      this.defends.sort(this.entity)

      this.fsm.update(1)
    }
    return super.update();
  }
  lock_when_stand_and_rest() {
    if (
      this.entity.frame.state === StateEnum.Standing &&
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

  action_desire(mark: string): number {
    let ret = this.desire(mark); // 默认action设置的desire是crazy的好了。
    for (let i = Difficulty.MAX - this.world.difficulty; i > 0; --i) {
      this.lf2.mt.mark = mark;
      ret += this.lf2.mt.range(0, ret);
    }
    return ret;
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
      const chasing = this.get_chasing()?.entity;
      if (!chasing) return false;
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

  move() {
    this.behavior = 'move'
  }
  stay() {
    this.behavior = 'stay'
  }
  goto(x: number, y: number, z: number) {
    this.following = [x, y, z]
  }
}
