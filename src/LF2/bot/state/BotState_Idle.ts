import { AGK, GK, SE, WeaponType as WT } from "@/LF2/defines";
import { max, min, round } from "@/LF2/utils";
import { BSE } from "../../defines/BotStateEnum";
import { BotState_Base } from "./BotState";

export class BotState_Idle extends BotState_Base {
  readonly key = BSE.Idle;
  override enter(): void {
    this.ctrl.key_up(...AGK);
  }
  override leave(): void {
    const { c, me } = this;
    if (me.state === SE.Drink) c.click(GK.d)
  }
  override update(dt: number) {
    if (this.stage.is_stage_finish)
      return BSE.StageEnd;
    const { c, me } = this;
    if (c.is_leave_goto_range(me))
      return BSE.Following;
    if (this.handle_bot_actions()) return;
    if (this.handle_defends()) return;

    const { x: my_x } = me.position;
    const { player_l, player_r } = this.stage;
    const pw = player_r - player_l;
    // 空闲时远离边界
    const mid = round((player_l + player_r) * 0.5)
    const min_x = round(min(player_l + min(300, pw / 3), mid))
    const max_x = round(max(player_r - min(300, pw / 3), mid))
    if (my_x < min_x) {
      c.key_down(GK.R).key_up(GK.L)
    } else if (my_x > max_x) {
      c.key_down(GK.L).key_up(GK.R)
    } else {
      c.key_up(GK.L, GK.R)
    }

    /* 概率停跑 */
    if (me.frame.state === SE.Running && c.desire('idle_stop_run') < 100) {
      c.click(me.facing > 0 ? GK.L : GK.R);
      return;
    }

    const { en, av } = this;
    const wt = me.holding?.base_type
    if (wt === WT.Drink) {
      if (av) return BSE.Avoiding;
      /* 喝 */
      if (
        me.state === SE.Running ||
        me.state === SE.Standing ||
        me.state === SE.Walking
      )
        c.click(GK.a);
      else
        c.click(GK.d);
    }

    const closest = this.closest(en, av)
    if (av && av == closest) return BSE.Avoiding;
    if (en && en == closest) return BSE.Chasing;
  }

}


