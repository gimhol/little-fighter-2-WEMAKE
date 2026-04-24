import { BotStateEnum, Defines, GK, StateEnum, AGK } from "../../defines";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { between, round_float } from "../../utils";
import { BotState_Base } from "./BotState";


export class BotState_Following extends BotState_Base {
  readonly key = BotStateEnum.Following;
  override enter(): void {
    this.ctrl.key_up(...AGK);
  }
  override update(dt: number) {
    if (this.stage.is_stage_finish) return BotStateEnum.StageEnd;
    super.update(dt);
    if (this.handle_defends()) return;
    if (this.handle_block()) return;
    this.random_jumping();

    const { ctrl: c } = this;
    const me = c.entity;

    if (c.goingto) {
      const { x: en_x, z: en_z } = c.goingto
      const { x: my_x, z: my_z } = me.position;
      const offset_x = Defines.AI_FOLLOWING_RANGE_X
      const offset_z = Defines.AI_FOLLOWING_RANGE_Z
      const bound_l = round_float(en_x - offset_x);
      const bound_r = round_float(en_x + offset_x);
      const bound_t = round_float(en_z - offset_z);
      const bound_b = round_float(en_z + offset_z);
      // shit.
      if (me.state !== StateEnum.Running) {
        if (my_x < bound_l)
          c.key_up(GK.R).key_down(GK.R).key_up(GK.L);
        else if (my_x > bound_r)
          c.key_up(GK.L).key_down(GK.L).key_up(GK.R);
        else
          c.key_up(GK.R, GK.L);
      } else {
        if (my_x < bound_l)
          c.key_down(GK.R).key_up(GK.L);
        else if (my_x > bound_r)
          c.key_down(GK.L).key_up(GK.R);
        else
          c.key_up(GK.R, GK.L);
      }


      if (my_z < bound_t) c.key_down(GK.D).key_up(GK.U);
      else if (my_z > bound_b) c.key_down(GK.U).key_up(GK.D);
      else c.key_up(GK.U, GK.D);

      if (
        !between(my_x, bound_l, bound_r) ||
        !between(my_z, bound_t, bound_b)
      ) return
    }
    if (me.state == StateEnum.Running) { // 别跑了
      this.ctrl.key_down(me.facing < 0 ? GK.R : GK.L)
    }
    // TODO: 是不是该想个办法让持续位移招式（dennis d>j）停下来？

    c.stop();
    this.ctrl.key_up(...AGK);
    const en = c.chasings.get()?.entity;
    const av = c.avoidings.get()?.entity;

    if (en && av && manhattan_xz(me, av) < manhattan_xz(me, en))
      return BotStateEnum.Avoiding;
    else if (en)
      return BotStateEnum.Chasing;
    else if (av)
      return BotStateEnum.Avoiding;
    else
      return BotStateEnum.Idle;
  }
}
