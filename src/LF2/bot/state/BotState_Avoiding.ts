
import { GK } from "../../defines";
import { BotStateEnum } from "../../defines/BotStateEnum";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { round_float } from "../../utils";
import { BotState_Base } from "./BotState";
export class BotState_Avoiding extends BotState_Base {
  readonly key = BotStateEnum.Avoiding;
  override update(dt: number) {
    super.update(dt)
    if (this.handle_defends()) return;
    if (this.handle_bot_actions()) return;
    if (this.handle_block()) return;
    if (this.defend_test()) return;
    this.random_jumping()
    const { ctrl: c } = this;
    if (c.goingto) return BotStateEnum.Following;
    const me = c.entity;
    const en = c.chasings.get()?.entity
    const av = c.avoidings.get()?.entity
    if (en && av && manhattan_xz(me, av) < manhattan_xz(me, en))
      return BotStateEnum.Avoiding;
    else if (en)
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
    let x_d: 0 | -1 | 1 = 0;
    if (en_x <= me_x) {
      // 敌人在左边
      x_d = en_x < round_float(right - 100) ? 1 : -1;
    } else {
      // 敌人在右边
      x_d = en_x > round_float(left + 100) ? -1 : 1;
    }
    switch (x_d) {
      case 1:
        c.key_down(GK.R).key_up(GK.L);
        break;
      case -1:
        c.key_down(GK.L).key_up(GK.R);
        break;
    }

    let z_d: 0 | -1 | 1 = 0;
    if (me_z <= en_z) {
      z_d = en_z > round_float(far + 50) ? 1 : -1;
    } else {
      z_d = en_z < round_float(near - 50) ? -1 : 1;
    }
    switch (z_d) {
      case 1:
        c.key_down(GK.U).key_up(GK.D);
        break;
      case -1:
        c.key_down(GK.D).key_up(GK.U);
        break;
    }

  }
}
