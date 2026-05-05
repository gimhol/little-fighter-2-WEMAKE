import { AGK, GK, SE, WeaponType as WT } from "@/LF2/defines";
import { max, min, round } from "@/LF2/utils";
import { BSE } from "../../defines/BotStateEnum";
import { BotState_Base } from "./BotState";

export class BotState_Idle extends BotState_Base {
  readonly key = BSE.Idle;
  override enter(): void {
    this.ctrl.key_up(...AGK)
  }
  override update(dt: number) {
    if (this.stage.is_stage_finish)
      return BSE.StageEnd;
    const { c, me } = this;
    if (this.ctrl.is_leave_goto_range(me))
      return BSE.Following;
    if (this.handle_bot_actions()) return;
    if (this.handle_defends()) return;

    const { x: my_x } = me.position;
    const { team, player_l, player_r } = this.stage;
    if (team !== me.team) {
      const mid = round((player_l + player_r) * 0.5)
      const min_x = min(player_l + 300, mid)
      const max_x = max(player_r - 300, mid)
      if (my_x < min_x) c.key_down(GK.R)
      else if (my_x > max_x) c.key_down(GK.L)
      else c.key_up(GK.R, GK.L)
    } else {
      c.key_up(GK.R, GK.L)
    }

    /* 概率停跑 */
    if (me.frame.state === SE.Running && c.desire('idle_stop_run') < 100)
      c.click(me.facing > 0 ? GK.L : GK.R);

    const { en, av } = this;
    const wt = me.holding?.base_type
    if (wt === WT.Drink) {
      /* 喝 */
      if (
        me.state === SE.Running ||
        me.state === SE.Standing ||
        me.state === SE.Walking
      ) c.click(GK.a);
      if (av) return BSE.Avoiding
    }


    const closest = this.closest(en, av)
    if (av && av == closest) return BSE.Avoiding;
    if (en && en == closest) return BSE.Chasing;
  }

  override leave(): void {
    const { ctrl: c } = this;
    const me = c.entity;
    if (me.state === SE.Drink)
      c.click(GK.d)
  }
}


