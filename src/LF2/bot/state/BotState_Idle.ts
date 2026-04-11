import { GameKey, StateEnum, WeaponType } from "@/LF2/defines";
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
    if (c.goingto) return BotStateEnum.Following;
    const me = c.entity;
    const en = c.chasings.get()?.entity
    const av = c.avoidings.get()?.entity
    if (en && av && manhattan_xz(me, av) < manhattan_xz(me, en))
      return BotStateEnum.Avoiding;
    else if (en)
      return BotStateEnum.Chasing;
    else if (av)
      return BotStateEnum.Avoiding;

    c.key_up(...KEY_NAME_LIST)
    if (
      me.holding?.data.base.type === WeaponType.Drink &&
      me.frame.state !== StateEnum.Drink
    ) c.key_down(GameKey.a)
  }
  override leave(): void {
    const { ctrl: c } = this;
    const me = c.entity;
    if (me.frame.state === StateEnum.Drink)
      c.click(GameKey.d)
  }
}


