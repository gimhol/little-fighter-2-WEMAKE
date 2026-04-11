import { is_fighter, is_weapon } from "@/LF2/entity";
import { KEY_NAME_LIST } from "../../controller/BaseController";
import { Defines, GK, StateEnum, WeaponType } from "../../defines";
import { BotStateEnum } from "../../defines/BotStateEnum";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { abs, between, round_float } from "../../utils";
import { BotState_Base } from "./BotState";

export class BotState_Chasing extends BotState_Base {
  readonly key = BotStateEnum.Chasing;
  override update(dt: number) {
    super.update(dt)

    const { ctrl: c } = this;
    if (c.goingto) return BotStateEnum.Following;
    const me = c.entity;
    const en = c.chasings.get()?.entity
    const av = c.avoidings.get()?.entity


    if (this.handle_defends()) return;
    if (is_fighter(en) && this.handle_bot_actions()) return;
    this.random_jumping()

    if (en && av && manhattan_xz(me, av) < manhattan_xz(me, en))
      return BotStateEnum.Avoiding;
    else if (!en)
      return BotStateEnum.Idle;

    const { facing: me_facing } = me
    const { x: my_x, z: my_z, y: my_y } = me.position;
    const { next_x: en_x, next_z: en_z, next_y: en_y } = c.guess_entity_pos(en);
    const { state } = me.frame;

    /** 
     * 敌人与自己的距离X
     * 敌人在背后时为负数
     * 敌人在正面时为正数
     */
    const dist_en_x = round_float(me_facing * (en_x - my_x))
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
    const wt = me.holding?.data.base.type;
    const out_of_range = c.en_out_of_range = (
      abs_dx > Defines.AI_STAY_CHASING_RANGE &&
      c.behavior === 'stay'
    ) || (
        me.team !== c.world.stage.team && (
          en_x < c.world.stage.player_l - 80 ||
          en_x > c.world.stage.player_r + 80
        )
      )
    // 过了头
    const x_to_much = (
      my_x > en_x && me_facing > 0 ||
      my_x < en_x && me_facing < 0 ||
      out_of_range
    )
    const GK_F = me_facing > 0 ? GK.R : GK.L
    const GK_B = me_facing > 0 ? GK.L : GK.R

    switch (state) {
      case StateEnum.Normal:
        if (this.defend_test()) return;
        break;
      case StateEnum.Running: {
        if (this.defend_test()) return;
        if (wt && between(abs_dz, 0, 30)) {
          if (wt == WeaponType.Knife) {
            if (this.ctrl.desire('rtwd') < 100) c.key_down(GK_F).click(GK.a)
          } else if (wt === WeaponType.Stick) {
            if (this.ctrl.desire('rtwd') < 50) c.key_down(GK_F).click(GK.a)
          } else if (wt === WeaponType.Drink) {
            if (this.ctrl.desire('rtwd') < 25) c.key_down(GK_F).click(GK.a)
          }
        }
        this.handle_block()
        if (x_to_much) { // 避免跑过头,停下
          c.key_down(GK_B).key_up(GK.L, GK.R)
        } else if (
          c.desire("chasing_1") < c.r_atk_desire &&
          between(dist_en_x, 0, c.r_atk_x) &&
          between(abs_dz, 0, c.r_atk_z) &&
          is_fighter(en)
        ) {
          // 概率跑攻
          c.click(GK.a).key_up(GK.R, GK.L)
        } else if (c.desire("chasing_2") < c.r_stop_desire) {
          // 概率刹车
          c.click(GK_B)
        } else break;
        return
      }
      case StateEnum.Injured:
        if (this.defend_test()) return;
        break;
      case StateEnum.Catching:
        // shit, louisEx air-push frame's state is StateEnum.Catching...
        if (me.catching) c.click(GK.a)
        break;
      case StateEnum.Defend:
        if (dist_en_x < 0) {
          c.key_down(me.facing == 1 ? GK.L : GK.R)
            .key_up(GK.L, GK.R)
        }
        return;
      case StateEnum.Attacking:
      case StateEnum.BurnRun:
      case StateEnum.Z_Moveable:
        if (my_z < round_float(en_z - c.w_atk_z)) {
          c.key_down(GK.D).key_up(GK.U);
        } else if (my_z > round_float(en_z + c.w_atk_z)) {
          c.key_down(GK.U).key_up(GK.D);
        } else {
          c.key_up(GK.D, GK.U);
        }
        break;
      case StateEnum.Standing:
      case StateEnum.Walking: {
        if (this.defend_test()) return;
        if (me.blockers.size) c.start(GK.a).end(GK.a)
        if (wt && between(abs_dz, 0, 30)) {
          if (wt == WeaponType.Knife) {
            if (this.ctrl.desire('rtwd') < 100) c.key_down(GK_F).click(GK.a)
          }
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
          between(abs_dz, 0, c.d_atk_z) &&
          is_fighter(en)
        ) {
          c.click(GK.a)
          return
        }
        break;
      }
      case StateEnum.Jump: {
        if (wt && between(abs_dz, 0, 30)) {
          if (wt == WeaponType.Knife) {
            if (this.ctrl.desire('rtwd') < 100) c.key_down(GK_F).click(GK.a)
          } else if (wt === WeaponType.Stick) {
            if (this.ctrl.desire('rtwd') < 50) c.key_down(GK_F).click(GK.a)
          } else if (wt === WeaponType.Drink) {
            if (this.ctrl.desire('rtwd') < 25) c.key_down(GK_F).click(GK.a)
          }
        }
        if (
          my_y > 10 &&
          between(dist_en_x, 0, c.j_atk_x) &&
          between(abs_dz, 0, c.j_atk_z) &&
          between(dist_en_y, c.j_atk_y_min, c.j_atk_y_max) &&
          is_fighter(en)
        ) {
          // 跳攻
          c.click(GK.a)
        } else if (!out_of_range) {
          if (my_x < en_x && abs_dx > c.w_atk_x) {
            // 转向
            c.key_down(GK.R).key_up(GK.L);
          } else if (my_x > en_x && abs_dx > c.w_atk_x) {
            // 转向
            c.key_down(GK.L).key_up(GK.R);
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
      if (my_x < round_float(en_x - c.w_atk_x)) c.key_down(GK.R).key_up(GK.L);
      else if (my_x > round_float(en_x + c.w_atk_x)) c.key_down(GK.L).key_up(GK.R);
      else c.key_up(GK.L, GK.R);
      if (my_z < round_float(en_z - c.w_atk_z)) c.key_down(GK.D).key_up(GK.U)
      else if (my_z > round_float(en_z + c.w_atk_z)) c.key_down(GK.U).key_up(GK.D)
      else c.key_up(GK.U, GK.D);
    } else if (me.facing > 0 && my_x > en_x) {
      c.click(GK.L)
    } else if (me.facing < 0 && my_x < en_x) {
      c.click(GK.R)
    } else {
      c.key_up(GK.L, GK.R, GK.U, GK.D);
    }

    this.handle_block()
    if (
      between(dist_en_x, -5, c.w_atk_x) &&
      between(abs_dz, 0, c.w_atk_z)
    ) {
      if (
        is_fighter(en) || (
          is_weapon(en) && (
            state === StateEnum.Walking ||
            state === StateEnum.Standing ||
            state === StateEnum.Rowing
          )
        )
      ) c.click(GK.a)
    } else {
      c.key_up(GK.a)
    }
    if (x_reach) {
      /** 回头 */
      if (my_x > en_x && me.facing > 0) {
        c.key_down(GK.L).key_up(GK.R);
      } else if (my_x < en_x && me.facing < 0) {
        c.key_down(GK.R).key_up(GK.L);
      } else {
        c.key_up(GK.L, GK.R)
      }
    }
  }
}

