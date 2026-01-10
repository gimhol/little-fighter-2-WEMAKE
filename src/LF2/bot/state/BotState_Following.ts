import { KEY_NAME_LIST } from "../../controller";
import { BotStateEnum, Defines, GK, StateEnum } from "../../defines";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { between, round_float } from "../../utils";
import { BotState_Base } from "./BotState";


export class BotState_Following extends BotState_Base {
  readonly key = BotStateEnum.Following;
  override enter(): void {
    this.ctrl.key_up(...KEY_NAME_LIST);
  }
  override update(dt: number) {
    super.update(dt);

    if (this.handle_defends()) return;
    this.random_jumping();

    const { ctrl: c } = this;
    const me = c.entity;

    if (c.following) {
      const [en_x, , en_z] = c.following
      const { x: my_x, z: my_z } = me.position;
      const offset_x = Defines.AI_FOLLOWING_RANGE_X
      const offset_z = Defines.AI_FOLLOWING_RANGE_Z
      const bound_l = round_float(en_x - offset_x);
      const bound_r = round_float(en_x + offset_x);
      const bound_t = round_float(en_z - offset_z);
      const bound_b = round_float(en_z + offset_z);

      switch (me.frame.state) {
        case StateEnum.Standing:
        case StateEnum.Walking:
          this.handle_block()
          if (my_x < bound_l) c.fast_click(GK.R);
          else if (my_x > bound_r) c.fast_click(GK.L);
          else c.key_up(GK.R, GK.L);
          if (my_z < bound_t) c.keep_press(GK.D);
          else if (my_z > bound_b) c.keep_press(GK.U);
          else c.key_up(GK.U, GK.D);
          break;
        case StateEnum.Dash:
        case StateEnum.Jump:
        case StateEnum.Running:
          this.handle_block()
          if (my_x > bound_r) c.keep_press(GK.L);
          else if (my_x < bound_l) c.keep_press(GK.R);
          else c.keep_press(me.facing < 0 ? GK.R : GK.L);
          if (my_z < bound_t) c.keep_press(GK.D);
          else if (my_z > bound_b) c.keep_press(GK.U);
          else c.key_up(GK.U, GK.D);
          break;
      }
      if (
        !between(my_x, bound_l, bound_r) ||
        !between(my_z, bound_t, bound_b)
      ) return
    }


    delete c.following;
    this.ctrl.key_up(...KEY_NAME_LIST);
    const en = c.get_chasing()?.entity;
    const av = c.get_avoiding()?.entity;

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
