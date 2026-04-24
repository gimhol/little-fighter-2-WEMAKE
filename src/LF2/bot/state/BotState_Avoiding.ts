
import { GK } from "../../defines";
import { BotStateEnum } from "../../defines/BotStateEnum";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { abs, round_float } from "../../utils";
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
    if (this.handle_bot_actions()) return;
    if (this.handle_defends()) return;
    this.random_jumping()
    if (en && av && manhattan_xz(me, av) > manhattan_xz(me, en))
      return BotStateEnum.Chasing;
    else if (!av)
      return BotStateEnum.Idle

    const { avoid_x, avoid_z } = c.dataset;
    const { x: me_x, z: me_z } = me.position;
    const { x: en_x, z: en_z } = av.position;

    const abs_x = abs(av.position.x - me.position.x)
    const abs_z = abs(av.position.z - me.position.z)
    if (abs_x > avoid_x && abs_z > avoid_z) {
      c.key_up(GK.L, GK.R, GK.U, GK.D);
      return BotStateEnum.Idle;
    }

    const { left, right, near, far } = c.lf2.world;
    
    /** next x direction */
    if (avoid_x > abs_x) {
      let x_d: -1 | 1;
      if (en_x <= me_x) { // 敌人在左边
        x_d = en_x < round_float(right - 100) ? 1 : -1;
      } else { // 敌人在右边
        x_d = en_x > round_float(left + 100) ? -1 : 1;
      }
      // 若与前进方向相背，则回头，然后才前进（目前db_hit无法进行回头）
      const XF = x_d > 0 ? GK.R : GK.L;

      if (me.facing != x_d) { // 回头
        c.key_down(XF)
      } else { // 奔跑（TODO: 调整奔跑的概率）
        c.db_hit(XF).key_up(GK.L, GK.R)
      }
    } else {
      c.key_up(GK.L, GK.R)
    }

    if (avoid_z > abs_z) {
      let z_d: -1 | 1;
      if (me_z <= en_z) {
        z_d = en_z > round_float(far + 25) ? 1 : -1;
      } else {
        z_d = en_z < round_float(near - 25) ? -1 : 1;
      }
      const ZF = z_d > 0 ? GK.U : GK.D;
      const ZB = z_d > 0 ? GK.D : GK.U;
      c.key_down(ZF).key_up(ZB);
    } else {
      c.key_up(GK.U, GK.D)
    }

    if (this.handle_block()) return;

  }
}
