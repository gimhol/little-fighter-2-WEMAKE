import type { LF2 } from "..";
import { summary_mgr } from "../entity";
import { Buff } from "./Buff";


export class Buff_MagicFlute extends Buff {
  constructor(lf2: LF2, id: string) {
    super(lf2, id);
    this.tick.max = 3;
    this.life.max = 16;
    this.life.set_lifes(1);
  }
  override job(): void {
    const injury = 1;
    const injury_r = 0.5;
    const attacker = this.world.entity_map.get(this.attacker);
    let slow = 0;
    for (let fast = 0; fast < this.targets.length; ++fast) {
      const vid = this.targets[fast];
      const victim = this.world.entity_map.get(vid);
      if (!victim) continue;
      if (slow !== fast) this.targets[slow] = this.targets[fast];
      const prev_hp = victim.hp;
      victim.hp_r -= injury_r;
      victim.hp -= injury;
      victim.fallinjury = 20;
      if (attacker) summary_mgr.apply_damage(attacker, injury, victim, prev_hp);
      slow++;
    }
    this.targets.length = slow;
  }
}
