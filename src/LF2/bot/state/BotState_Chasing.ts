import { KEY_NAME_LIST } from "../../controller/BaseController";
import { Defines, GK, ItrKind, StateEnum } from "../../defines";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { abs, between, find, round_float } from "../../utils";
import { BotState_Base } from "./BotState";
import { BotStateEnum } from "../../defines/BotStateEnum";

export class BotState_Chasing extends BotState_Base {
  readonly key = BotStateEnum.Chasing;
  override update(dt: number) {
    super.update(dt)
    if (this.handle_defends()) return;
    if (this.handle_bot_actions()) return;
    this.random_jumping()

    const { ctrl: c } = this;
    if (c.following) return BotStateEnum.Following;
    const me = c.entity;
    const en = c.get_chasing()?.entity
    const av = c.get_avoiding()?.entity
    if (en && av && manhattan_xz(me, av) < manhattan_xz(me, en))
      return BotStateEnum.Avoiding;
    else if (!en)
      return BotStateEnum.Idle;

    const { facing: a_facing } = me
    const { x: my_x, z: my_z, y: my_y } = me.position;
    const { next_x: en_x, next_z: en_z, next_y: en_y } = c.guess_entity_pos(en);
    const { state } = me.frame;

    /** 
     * 敌人与自己的距离X
     * 敌人在背后时为负数
     * 敌人在正面时为正数
     */
    const dist_en_x = round_float(a_facing * (en_x - my_x))
    /** 
     * 敌人与自己的距离y
     * 敌人在上方时为正数
     * 敌人在下面时为负数数
     */
    const dist_en_y = round_float(en_y - my_y)

    /**
     * 敌人与自己的距离X
     */
    const abs_dx = round_float(abs(my_x - en_x))
    /**
     * 敌人与自己的距离Z
     */
    const abs_dz = round_float(abs(my_z - en_z))

    const x_reach = abs_dx <= c.w_atk_x;
    const z_reach = abs_dz <= c.w_atk_z;

    const out_of_range = c.en_out_of_range = (
      abs_dx > Defines.AI_STAY_CHASING_RANGE &&
      c.behavior === 'stay'
    ) || (
        me.team !== c.world.stage.team && (
          en_x < c.world.stage.player_l - 80 ||
          en_x > c.world.stage.player_r + 80
        )
      )

    switch (state) {
      case StateEnum.Normal:
        if (this.defend_test()) return;
        break;
      case StateEnum.Running: {
        if (this.defend_test()) return;
        this.handle_block()

        if (a_facing > 0 && (abs_dx < c.w_atk_x || out_of_range)) { // 避免跑过头停下
          c.keep_press(GK.L)
        } else if (a_facing < 0 && (abs_dx < c.w_atk_x || out_of_range)) { // 避免跑过头停下
          c.keep_press(GK.R)
        } else if (
          c.desire("chasing_1") < c.r_atk_desire &&
          between(dist_en_x, 0, c.r_atk_x) &&
          between(abs_dz, 0, c.r_atk_z)
        ) {
          // 概率跑攻
          c.fast_click(GK.a).key_up(GK.R, GK.L)
        } else if (c.desire("chasing_2") < c.r_stop_desire) {
          // 概率刹车
          c.fast_click(a_facing < 0 ? GK.R : GK.L)
        } else break;
        return
      }
      case StateEnum.Injured:
        if (c.action_desire("chasing_3") < c.d_desire)
          c.fast_click(GK.d)
        break;
      case StateEnum.Catching:
        // shit, louisEx air-push frame's state is StateEnum.Catching...
        if (me.catching) c.fast_click(GK.a)
        break;
      case StateEnum.Attacking:
      case StateEnum.BurnRun:
      case StateEnum.Z_Moveable:
        if (my_z < round_float(en_z - c.w_atk_z)) {
          c.keep_press(GK.D);
        } else if (my_z > round_float(en_z + c.w_atk_z)) {
          c.keep_press(GK.U);
        } else {
          c.key_up(GK.D, GK.U);
        }
        break;
      case StateEnum.Standing:
      case StateEnum.Walking: {
        if (this.defend_test()) return;
        if (find(me.v_rests, v => v[1].itr.kind === ItrKind.Block)) {
          c.start(GK.a).end(GK.a)
        }
        if (!out_of_range) {
          const { r_desire } = c;
          if (r_desire > 0) {
            c.db_hit(GK.R).end(GK.R);
          } else if (r_desire < 0) {
            c.db_hit(GK.L).end(GK.L);
          } else {
            break;
          }
        }
        break;
      }
      case StateEnum.Dash: {
        this.handle_block()
        if (
          between(dist_en_x, 0, c.d_atk_x) &&
          between(abs_dz, 0, c.d_atk_z)
        ) {
          c.keep_press(GK.a)
          return
        }
        break;
      }
      case StateEnum.Jump: {
        if (
          my_y > 10 &&
          between(dist_en_x, 0, c.j_atk_x) &&
          between(abs_dz, 0, c.j_atk_z) &&
          between(dist_en_y, c.j_atk_y_min, c.j_atk_y_max)
        ) {
          // 跳攻
          c.fast_click(GK.a)
        } else if (!out_of_range) {
          if (my_x < en_x && abs_dx > c.w_atk_x) {
            // 转向
            c.keep_press(GK.R);
          } else if (my_x > en_x && abs_dx > c.w_atk_x) {
            // 转向
            c.keep_press(GK.L);
          } else {
            c.key_up(GK.L, GK.R);
            break;
          }
        }
        return
      }
      default:
        c.key_up(...KEY_NAME_LIST);

    }
    if (!out_of_range) {
      if (my_x < round_float(en_x - c.w_atk_x)) c.keep_press(GK.R);
      else if (my_x > round_float(en_x + c.w_atk_x)) c.keep_press(GK.L);
      else c.key_up(GK.L, GK.R);
      if (my_z < round_float(en_z - c.w_atk_z)) c.keep_press(GK.D)
      else if (my_z > round_float(en_z + c.w_atk_z)) c.keep_press(GK.U)
      else c.key_up(GK.U, GK.D);
    } else if (me.facing > 0 && my_x > en_x) {
      c.fast_click(GK.L)
    } else if (me.facing < 0 && my_x < en_x) {
      c.fast_click(GK.R)
    } else {
      c.key_up(GK.L, GK.R, GK.U, GK.D);
    }
    if (
      between(dist_en_x, 0, c.w_atk_x) &&
      between(abs_dz, 0, c.w_atk_z)
    ) {
      c.fast_click(GK.a)
    } else {
      c.key_up(GK.a)
    }
    if (x_reach && z_reach) {
      /** 回头 */
      if (abs_dx <= 5) {
        c.key_up(GK.L, GK.R)
        c.fast_click(GK.a)
      } else if (my_x > en_x && me.facing > 0) {
        c.key_down(GK.L).key_up(GK.R);
      } else if (my_x < en_x && me.facing < 0) {
        c.key_down(GK.R).key_up(GK.L);
      }
    }
  }

}

