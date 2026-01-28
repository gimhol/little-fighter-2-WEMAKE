import { KEY_NAME_LIST } from "../../controller/BaseController";
import { BotStateEnum } from "../../defines/BotStateEnum";
import { manhattan_xz } from "../../helper/manhattan_xz";
import { BotState_Base } from "./BotState";

export class BotState_Idle extends BotState_Base {
  readonly key = BotStateEnum.Idle;
  override enter(): void {
    this.ctrl.key_up(...KEY_NAME_LIST)
  }
  override update(dt: number) {
    super.update(dt)
    if (this.handle_defends()) return;
    if (this.handle_bot_actions()) return;
    this.random_jumping()

    const { ctrl: c } = this;
    if (c.following) return BotStateEnum.Following;
    const me = c.entity;
    const en = c.chasings.get()?.entity
    const av = c.avoidings.get()?.entity

    if (en && av && manhattan_xz(me, av) < manhattan_xz(me, en))
      return BotStateEnum.Avoiding;
    else if (en)
      return BotStateEnum.Chasing;
    else if (av)
      return BotStateEnum.Avoiding;
    this.ctrl.key_up(...KEY_NAME_LIST)
  }
}


