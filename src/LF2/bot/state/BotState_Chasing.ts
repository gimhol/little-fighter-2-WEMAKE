import { is_fighter, is_weapon } from "@/LF2/entity";
import { AGK, Defines, GK, StateEnum, WeaponType, WT } from "../../defines";
import { BotStateEnum, BSE } from "../../defines/BotStateEnum";
import { abs, between, round, round_float } from "../../utils";
import { BotBehavior } from "../BotController";
import { BotState_Base } from "./BotState";

export class BotState_Chasing extends BotState_Base {
  readonly key = BSE.Chasing;
  override update(dt: number) {
    if (this.stage.is_stage_finish) return BSE.StageEnd;
    const { ctrl: c } = this;
    const me = c.entity;
    const en = c.chasings.get()?.entity

    if (en && this.ctrl.is_leave_chase_range(en))
      return BSE.Following;
    if (this.ctrl.is_leave_goto_range(me))
      return BSE.Following;

    if (this.handle_bot_actions()) return;
    if (this.handle_defends()) return;
    this.handle_block()

    if (!en) return BSE.Idle;

    const { facing: me_facing } = me
    const { x: my_x, z: my_z, y: my_y } = me.position;
    const { next_x: en_x, next_z: en_z, next_y: en_y } = c.guess_entity_pos(en);
    const { state } = me.frame;

    /** 
     * 敌人与自己的距离X
     * 敌人在背后时为负数
     * 敌人在正面时为正数
     */
    const en_rx = round_float(me_facing * (en_x - my_x))
    /** 
     * 敌人与自己的距离y
     * 敌人在上方时为正数
     * 敌人在下面时为负数数
     */
    const en_ry = round_float(en_y - my_y)

    /** 敌人与自己的距离X */
    const abs_dx = round_float(abs(my_x - en_x))

    if (
      abs_dx > Defines.AI_STAY_CHASING_RANGE &&
      (
        c.behavior === BotBehavior.Stay ||
        c.behavior === BotBehavior.Follow
      )
    ) {
      c.en_out_of_range = true;
      return BotStateEnum.Following;
    }


    /** 敌人与自己的距离Z */
    const abs_dz = round_float(abs(my_z - en_z))

    const is_weapon_picking = is_weapon(en)
    /** abs_dx <= c.stand_atk_f_x */
    const x_reach = abs_dx <= c.stand_atk_f_x;
    const z_reach = abs_dz <= c.dataset.w_atk_z;

    // 随机跳
    if (!x_reach || !z_reach) this.random_jumping();

    /** 持有武器的类型 */
    const wt = me.holding?.base_type;

    c.en_out_of_range = me.team !== c.world.stage.team && (
      en_x < c.world.stage.player_l - 80 ||
      en_x > c.world.stage.player_r + 80
    )

    const GK_F = me_facing > 0 ? GK.R : GK.L;
    const GK_B = me_facing > 0 ? GK.L : GK.R;
    switch (state) {
      case StateEnum.Running: {
        /** 目标已在攻击范围内 */
        const en_in_range = (
          between(en_rx, c.stand_atk_b_x, c.stand_atk_f_x) &&
          between(abs_dz, -c.dataset.r_atk_z, c.dataset.r_atk_z)
        )

        if (!en_in_range) {
          // 避免跑过头,停下
          if (
            my_x > en_x && me_facing > 0 ||
            my_x < en_x && me_facing < 0
          ) {
            c.click(GK_B)
            return;
          }
          // 概率刹车
          if (c.desire("chasing_stop_running_1") < c.dataset.r_stop_desire) {
            c.click(GK_B);
            return
          }
          // 概率丢武器
          if (wt && between(abs_dz, 0, 30)) {
            if (wt == WeaponType.Knife && this.ctrl.desire('rtwd_1') < 400) {
              c.key_down(GK_F).click(GK.a)
              return;
            } else if (wt === WeaponType.Stick && this.ctrl.desire('rtwd_2') < 100) {
              c.key_down(GK_F).click(GK.a)
              return;
            } else if (wt === WeaponType.Drink && this.ctrl.desire('rtwd_3') < 50) {
              c.key_down(GK_F).click(GK.a)
              return;
            }
          }
          return
        }

        if (en_in_range && is_weapon(en)) {
          if (en.base_type == WT.Heavy) {
            c.click(GK_B)
          } else {
            c.click(GK.d, GK.a)
          }
          return;
        }
        if (en_in_range && is_fighter(en) && c.desire("chasing_1") < c.dataset.r_atk_desire) {
          c.click(GK.a);
        }
        return;
      }
      case StateEnum.Catching:
        // shit, louisEx air-push frame's state is StateEnum.Catching...
        if (me.catching) c.click(GK.a)
        break;
      case StateEnum.Standing:
      case StateEnum.Walking: {
        if (wt && between(abs_dz, 0, 30)) {
          if (wt == WeaponType.Knife) {
            if (this.ctrl.desire('rtwd') < 400) {
              c.key_down(GK_F).click(GK.a)
            }
          }
        }
        if (!c.en_out_of_range) {
          const r_desire = c.should_run(en.position);
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
        if (
          between(en_rx, 0, c.d_atk_x) &&
          between(abs_dz, 0, c.dataset.d_atk_z) &&
          is_fighter(en)
        ) {
          c.key_down(GK.a)
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
          between(en_rx, 0, c.j_atk_x) &&
          between(abs_dz, 0, c.dataset.j_atk_z) &&
          between(en_ry, c.dataset.j_atk_y_min, c.dataset.j_atk_y_max) &&
          is_fighter(en)
        ) {
          // 跳攻
          c.key_down(GK.a)
          return
        } else if (!c.en_out_of_range) {
          if (my_x < en_x && abs_dx > c.stand_atk_f_x) {
            // 转向
            c.key_down(GK.R).key_up(GK.L);
          } else if (my_x > en_x && abs_dx > c.stand_atk_f_x) {
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
        c.key_up(...AGK);

    }



    if (
      between(en_rx, c.stand_atk_b_x, c.stand_atk_f_x) &&
      between(abs_dz, -c.dataset.w_atk_z, c.dataset.w_atk_z)
    ) {
      if (is_weapon_picking) {
        switch (me.frame.state) {
          case StateEnum.Standing:
          case StateEnum.Walking:
            c.click(GK.a)
            break;
        }
      } else {
        c.click(GK.a)
      }
    } else {
      c.key_up(GK.a)
    }
    if (my_z < round(en_z - c.dataset.w_atk_z)) c.key_down(GK.D).key_up(GK.U)
    else if (my_z > round(en_z + c.dataset.w_atk_z)) c.key_down(GK.U).key_up(GK.D)
    else c.key_up(GK.U, GK.D);

    if (x_reach) {
      /** 回头 */
      if (abs_dx < 3) {
        c.key_up(GK.L, GK.R)
      } else if (my_x > en_x && me.facing > 0) {
        c.key_down(GK.L).key_up(GK.R);
      } else if (my_x < en_x && me.facing < 0) {
        c.key_down(GK.R).key_up(GK.L);
      } else {
        c.key_up(GK.L, GK.R)
      }
    } else if (my_x < round(en_x - c.stand_atk_f_x)) c.key_down(GK.R).key_up(GK.L);
    else if (my_x > round(en_x + c.stand_atk_f_x)) c.key_down(GK.L).key_up(GK.R);
    else c.key_up(GK.L, GK.R);

    const { team, player_l, player_r } = this.stage
    if (team === me.team) {
      if (my_x < player_l) c.click(GK.R)
      if (my_x > player_r) c.click(GK.L)
    }
  }
}

