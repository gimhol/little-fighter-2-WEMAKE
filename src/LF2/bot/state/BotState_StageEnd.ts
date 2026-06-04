
import { AGK, GK, StateEnum } from "@/LF2/defines";
import { BSE } from "../../defines/BotStateEnum";
import { BotState_Base } from "./BotState";

export class BotState_StageEnd extends BotState_Base {
  override key = BSE.StageEnd;
  override enter(): void {
    this.ctrl.key_up(...AGK);
  }
  override leave(): void {
    this.ctrl.key_up(...AGK);
  }
  override update(dt: number): BSE | undefined {
    if (this.me.hp <= 0) return BSE.Dead;
    const c = this.ctrl;
    const me = c.entity;
    this.handle_block();
    if (!c.world.stage.is_stage_finish) {
      c.key_down(me.facing > 0 ? GK.L : GK.R)
      return BSE.Idle;
    }
    if (me.state !== StateEnum.Running)
      c.key_down(GK.R).key_up(...AGK);
  }
}
