import { LF2 } from "../LF2";
import { Buff } from "./Buff";

export class Buff_Electroshock extends Buff {
  constructor(lf2: LF2, id: string) {
    super(lf2, id);
    this.tick.max = 2;
  }
  override job(): void {
    const attacker = this.world.entity_map.get(this.attacker);
    let slow = 0;
    for (let fast = 0; fast < this.targets.length; ++fast) {
      const vid = this.targets[fast];
      const victim = this.world.entity_map.get(vid);
      if (!victim) continue;
      if (slow !== fast) this.targets[slow] = this.targets[fast];
      slow++;
      victim.wait += 1;
    }
    this.targets.length = slow;
  }
}
