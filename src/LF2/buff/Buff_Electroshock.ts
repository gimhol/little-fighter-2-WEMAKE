import { SE } from "../defines";
import { is_fighter } from "../entity/type_check";
import { LF2 } from "../LF2";
import { Buff } from "./Buff";

export class Buff_Electroshock extends Buff {
  static override readonly KIND = "Electroshock";
  constructor(lf2: LF2, id: string) {
    super(lf2, id);
    this.tick.max = 3;
  }
  override job(): void {
    let slow = 0;
    for (let fast = 0; fast < this.victims.length; ++fast) {
      const vid = this.victims[fast];
      const victim = this.world.entity_map.get(vid);
      if (!victim || !is_fighter(victim)) continue;
      if (slow !== fast) this.victims[slow] = this.victims[fast];
      slow++;
      if (victim.state === SE.Falling) continue;
      if (victim.state === SE.Injured) continue;
      if (victim.state === SE.Lying) continue;
      victim.wait += 1;
    }
    this.victims.length = slow;
  }
}
