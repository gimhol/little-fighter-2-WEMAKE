
import { GK, StateEnum } from "@/LF2/defines";
import { KEY_NAME_LIST } from "../../controller";
import { BotStateEnum } from "../../defines/BotStateEnum";
import { BotState_Base } from "./BotState";

export class BotState_StageEnd extends BotState_Base {
  override key = BotStateEnum.StageEnd;
  override enter(): void {
    this.ctrl.key_up(...KEY_NAME_LIST);
  }
  override leave(): void {
    this.ctrl.key_up(...KEY_NAME_LIST);
  }
  override update(dt: number): BotStateEnum | undefined | void {
    const c = this.ctrl;
    const me = c.entity;
    if (!c.world.stage.is_stage_finish) {
      c.key_down(me.facing > 0 ? GK.L : GK.R)
      return BotStateEnum.Idle;
    }
    if (me.frame.state !== StateEnum.Running)
      c.key_down(GK.R).key_up(...KEY_NAME_LIST);
    if (me.blockers.size)
      c.start(GK.a).end(GK.a)
  }
}
