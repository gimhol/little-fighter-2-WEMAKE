import { O_ID } from "@/LF2/defines";
import { Entity } from "@/LF2/entity/Entity";
import { TestCase } from "../TestCase";

export class BotAvoiding extends TestCase {
  override name: string = 'Bot Avoiding';
  override enter(): void {
    this.entities = this.hori_2(O_ID.Bandit)
  }
}