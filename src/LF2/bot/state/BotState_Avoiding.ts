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

    if (c.is_leave_avoid_zone(av)) {
      c.key_up(...AGK);
      return BotStateEnum.Idle;
    }

    const av_edge_l = c.world.left + 80;
    const av_edge_r = c.world.right - 80;
    const av_edge_b = c.world.near - 35;
    const av_edge_t = c.world.far + 35;

    let z_forwrd_key: GK;
    if (av_z > av_edge_b)      // enmey reach bottom edge
      z_forwrd_key = GK.U
    else if (av_z < av_edge_t) // enmey reach top edge
      z_forwrd_key = GK.D
    else if (av_z === me_z)    // same? make offset
      z_forwrd_key = (av_z + av.facing) > me_z ? GK.U : GK.D
    else
      z_forwrd_key = av_z > me_z ? GK.U : GK.D


    let x_forwrd_key: GK;
    if (av_x > av_edge_r)      // enmey reach right edge
      x_forwrd_key = GK.L
    else if (av_x < av_edge_l) // enmey reach left edge
      x_forwrd_key = GK.R
    else if (av_x === me_x) // same? make offset
      x_forwrd_key = (av_x + av.facing) > me_x ? GK.L : GK.R;
    else
      x_forwrd_key = av_x > me_x ? GK.L : GK.R;

    let z_backward_key = z_forwrd_key == GK.D ? GK.U : GK.D
    let x_backward_key = x_forwrd_key == GK.L ? GK.R : GK.L;

    
    c.key_down(z_forwrd_key, x_forwrd_key)
    c.key_up(z_backward_key, x_backward_key)
  }
}