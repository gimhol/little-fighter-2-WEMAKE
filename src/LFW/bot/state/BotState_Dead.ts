import { BSE, AGK } from "../../defines";
import { BotState_Base } from "./BotState";


export class BotState_Dead extends BotState_Base {
  readonly key = BSE.Dead;
  override enter(): void {
    this.c.key_up(...AGK);
  }
  override update(dt: number): BSE | undefined {
    if (this.me.hp > 0) return BSE.Idle;
  }
}
