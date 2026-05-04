import { AGK, GK, StateEnum, WeaponType } from "@/LF2/defines";
import { max, min, round } from "@/LF2/utils";
import { BotStateEnum } from "../../defines/BotStateEnum";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { BotState_Base } from "./BotState";

export class BotState_Idle extends BotState_Base {
  readonly key = BotStateEnum.Idle;
  override enter(): void {
    this.ctrl.key_up(...AGK)
  }
  override update(dt: number) {
    super.update(dt)
    const { ctrl: c } = this;
    if (c.goingto) return BotStateEnum.Following;
    const me = c.entity;
    const en = c.chasings.get()?.entity
    const av = c.avoidings.get()?.entity

    if (this.stage.is_stage_finish) return BotStateEnum.StageEnd;
    if (this.handle_defends()) return;
    if (this.handle_bot_actions()) return;

    if (en && av && manhattan_xz(me, av) < manhattan_xz(me, en))
      return BotStateEnum.Avoiding;
    else if (en)
      return BotStateEnum.Chasing;
    else if (av)
      return BotStateEnum.Avoiding;

    const { x: my_x } = me.position;
    const { team, player_l, player_r } = this.stage;
    if (team !== me.team) {
      const mid = round((player_l + player_r) * 0.5)
      const min_x = min(player_l + 100, mid)
      const max_x = max(player_r - 100, mid)
      if (my_x < min_x) c.key_down(GK.R)
      else if (my_x > max_x) c.key_down(GK.L)
      else c.key_up(GK.R, GK.L)
    } else {
      c.key_up(...AGK)
    }


    /* 喝 */
    if (
      me.holding?.base_type === WeaponType.Drink && (
        me.state === StateEnum.Running ||
        me.state === StateEnum.Standing ||
        me.state === StateEnum.Walking
      )
    ) c.click(GK.a)

    /* 概率停跑 */
    if (me.frame.state === StateEnum.Running && c.desire('idle_stop_run') < 100)
      c.click(me.facing > 0 ? GK.L : GK.R);


  }

  override leave(): void {
    const { ctrl: c } = this;
    const me = c.entity;
    if (me.state === StateEnum.Drink)
      c.click(GK.d)
  }
}


