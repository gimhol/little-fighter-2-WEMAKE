
import { is_fighter } from "@/LF2/entity";
import { GK } from "../../defines";
import { BotStateEnum } from "../../defines/BotStateEnum";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { round_float } from "../../utils";
import { BotState_Base } from "./BotState";
export class BotState_Avoiding extends BotState_Base {
  readonly key = BotStateEnum.Avoiding;
  override update(dt: number) {
    super.update(dt)
    if (this.stage.is_stage_finish) return BotStateEnum.StageEnd;
    const { ctrl: c } = this;
    if (c.goingto) return BotStateEnum.Following;
    const me = c.entity;
    const en = c.chasings.get()?.entity
    const av = c.avoidings.get()?.entity
    if (this.handle_defends()) return;
    if (is_fighter(en) && this.handle_bot_actions()) return;
    if (this.defend_test()) return;
    this.random_jumping()
    if (en && av && manhattan_xz(me, av) > manhattan_xz(me, en))
      return BotStateEnum.Chasing;
    else if (!av)
      return BotStateEnum.Idle


    const { x: me_x, z: me_z } = me.position;
    const { x: en_x, z: en_z } = av.position;

    const distance = manhattan_xz(me, av);
    if (distance > 300) {
      c.key_up(GK.L, GK.R, GK.U, GK.D);
      return BotStateEnum.Idle;
    }

    const { left, right, near, far } = c.lf2.world;
    /** next x direction */
    let x_d: -1 | 1;
    if (en_x <= me_x) {
      // 敌人在左边
      x_d = en_x < round_float(right - 100) ? 1 : -1;
    } else {
      // 敌人在右边
      x_d = en_x > round_float(left + 100) ? -1 : 1;
    }

    // 若与前进方向相背，则回头，然后才前进（目前db_hit无法进行回头）
    const XF = x_d > 0 ? GK.R : GK.L;
    // 回头
    if (me.facing != x_d) c.key_down(XF)
    // 奔跑（TODO: 调整奔跑的概率）
    else c.db_hit(XF).key_up(GK.L, GK.R)


    let z_d: -1 | 1;
    if (me_z <= en_z) {
      z_d = en_z > round_float(far + 50) ? 1 : -1;
    } else {
      z_d = en_z < round_float(near - 50) ? -1 : 1;
    }

    const ZF = z_d > 0 ? GK.U : GK.D;
    const ZB = z_d > 0 ? GK.D : GK.U;
    c.key_down(ZF).key_up(ZB);

    if (this.handle_block()) return;

  }
}
