
import { GK, StateEnum, AGK } from "@/LF2/defines";
import { BotStateEnum } from "../../defines/BotStateEnum";
import { BotState_Base } from "./BotState";

export class BotState_StageEnd extends BotState_Base {
  override key = BotStateEnum.StageEnd;
  override enter(): void {
    this.ctrl.key_up(...AGK);
  }
  override leave(): void {
    this.ctrl.key_up(...AGK);
  }
  override update(dt: number): BotStateEnum | undefined | void {
    const c = this.ctrl;
    const me = c.entity;
    if (!c.world.stage.is_stage_finish) {
      c.key_down(me.facing > 0 ? GK.L : GK.R)
      return BotStateEnum.Idle;
    }
    if (me.state !== StateEnum.Running)
      c.key_down(GK.R).key_up(...AGK);
    if (me.blockers.size)
      c.start(GK.a).end(GK.a)
  }
}
