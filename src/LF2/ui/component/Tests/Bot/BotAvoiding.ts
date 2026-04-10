import { O_ID, TeamEnum } from "@/LF2/defines";
import { TestCase } from "../TestCase";
import { new_id } from "@/LF2/base";

export class BotAvoiding extends TestCase {
  override name: string = 'Bot Avoiding';
  override enter(): void {
    this.entities = this.hori_2(O_ID.Bandit)
    this.entities.forEach((e, i) => {
      e.team = '' + (i + 1);
      e.blinking = i ? Number.MAX_SAFE_INTEGER : 0;
      e.key_role = true;
      e.name = i ? 'Attacker' : 'Victim'
      this.lf2.factory.create_ctrl(e.data.id, new_id(), e)
    })
  }
}