import { AGK, GK } from "../../defines";
import { BotStateEnum } from "../../defines/BotStateEnum";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { abs } from "../../utils";
import { BotState_Base } from "./BotState";

export class BotState_Avoiding extends BotState_Base {
  readonly key = BotStateEnum.Avoiding;
  override update(dt: number) {
    super.update(dt);
    if (this.stage.is_stage_finish) return BotStateEnum.StageEnd;

    const { ctrl: c } = this;
    if (c.goingto) return BotStateEnum.Following;

    const me = c.entity;
    const en = c.chasings.get()?.entity;
    const av = c.avoidings.get()?.entity;

    if (this.handle_defends()) return;
    if (this.handle_bot_actions()) return;

    if (!av) return BotStateEnum.Idle;
    if (en && manhattan_xz(me, av) > manhattan_xz(me, en)) {
      return BotStateEnum.Chasing;
    }

    let av_x = av.position.x;
    let av_z = av.position.z;
    const me_x = me.position.x;
    const me_z = me.position.z;

    if (av_z === me_z) av_z += this.oz;
    if (av_x === me_x) av_x += this.oz;

    if (c.is_leave_avoid_zone(av)) {
      c.key_up(...AGK);
      return BotStateEnum.Idle;
    }


    const z_forwrd_key = av_z > me_z ? GK.U : GK.D
    const z_backward_key = av_z > me_z ? GK.D : GK.U
    c.key_down(z_forwrd_key).key_up(z_backward_key);

    const x_forwrd_key = av_x > me_x ? GK.L : GK.R;
    const x_backward_key = av_x > me_x ? GK.R : GK.L;

    const edge_l = c.world.left + 10;
    const edge_r = c.world.right + 10;

    c.key_down(x_forwrd_key).key_up(x_backward_key);

  }
}