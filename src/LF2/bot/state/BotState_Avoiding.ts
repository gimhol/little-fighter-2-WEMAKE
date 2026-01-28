
import { GK, ItrKind, StateEnum } from "../../defines";
import { BotStateEnum } from "../../defines/BotStateEnum";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { find, round_float } from "../../utils";
import { BotState_Base } from "./BotState";
export class BotState_Avoiding extends BotState_Base {
  readonly key = BotStateEnum.Avoiding;
  override update(dt: number) {
    super.update(dt)
    if (this.handle_defends()) return;
    if (this.handle_bot_actions()) return;
    this.random_jumping()

    const { ctrl: c } = this;
    if (c.following) return BotStateEnum.Following;
    const me = c.entity;
    const en = c.chasings.get()?.entity
    const av = c.avoidings.get()?.entity
    const { state } = me.frame;

    if (en && av && manhattan_xz(me, av) < manhattan_xz(me, en))
      return BotStateEnum.Avoiding;
    else if (en)
      return BotStateEnum.Chasing;
    else if (!av)
      return BotStateEnum.Idle

    switch (state) {
      case StateEnum.Normal:
      case StateEnum.Standing:
      case StateEnum.Walking:
      case StateEnum.Running:
        if (this.defend_test())
          return;
    }
    if (find(me.v_rests, v => v[1].itr.kind === ItrKind.Block)) {
      c.start(GK.a).end(GK.a)
    }
    const { x, z } = me.position;
    const { x: enemy_x, z: enemy_z } = av.position;

    const distance = manhattan_xz(me, av);
    if (distance > 200) {
      c.end(GK.L, GK.R, GK.U, GK.D);
      return;
    }

    const { left, right, near, far } = c.lf2.world.bg;
    let x_d: 0 | -1 | 1 = 0;
    if (enemy_x <= x) {
      x_d = enemy_x < round_float(right - 200) ? 1 : -1;
    } else {
      x_d = enemy_x > round_float(left + 200) ? -1 : 1;
    }
    switch (x_d) {
      case 1:
        if (distance < 25) c.db_hit(GK.R).end(GK.L);
        else c.is_end(GK.R) && c.start(GK.R).end(GK.L);
        break;
      case -1:
        if (distance < 25) c.db_hit(GK.L).end(GK.R);
        else c.is_end(GK.L) && c.start(GK.L).end(GK.R);
        break;
    }

    let z_d: 0 | -1 | 1 = 0;
    if (z <= enemy_z) {
      z_d = enemy_z > round_float(far + 50) ? 1 : -1;
    } else {
      z_d = enemy_z < round_float(near - 50) ? -1 : 1;
    }
    switch (z_d) {
      case 1:
        c.is_end(GK.U) && c.start(GK.U).end(GK.D);
        break;
      case -1:
        c.is_end(GK.D) && c.start(GK.D).end(GK.U);
        break;
    }

  }
}
