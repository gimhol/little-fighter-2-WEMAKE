import { EntityEnum, SpeedMode, StateEnum, type LF2 } from "..";
import { calc_v, summary_mgr } from "../entity";
import { Buff } from "./Buff";


export class Buff_MagicFlute extends Buff {
  constructor(lf2: LF2, id: string) {
    super(lf2, id);
    this.tick.max = 3;
    this.life.max = 2;
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
      slow++;
      const prev_hp = victim.hp;
      victim.hp_r -= injury_r;
      victim.hp -= injury;
      victim.fallinjury = 20;
      victim.toughness = 0;
      if (attacker) summary_mgr.apply_damage(attacker, injury, victim, prev_hp);
    }
    this.targets.length = slow;
  }

  override update(d: number): void {
    super.update(d);

    const attacker = this.world.entity_map.get(this.attacker);

    let slow = 0;
    for (let fast = 0; fast < this.targets.length; ++fast) {
      const vid = this.targets[fast];
      const victim = this.world.entity_map.get(vid);
      if (!victim) continue;
      if (slow !== fast) this.targets[slow] = this.targets[fast];
      slow++;

      const vy = calc_v(victim.velocity.y, 3, SpeedMode.AccTo, 3, 1)
      victim.set_velocity_y(vy)
      victim.handle_velocity_decay(0.25);
      switch (victim.data.type) {
        case EntityEnum.Fighter:
          if (victim.state !== StateEnum.Falling) {
            victim.enter_frame({ id: victim.data.indexes?.falling?.[-1][0] })
          }
          break;
        case EntityEnum.Weapon:
          switch (victim.state) {
            case StateEnum.Weapon_InTheSky:
            case StateEnum.HeavyWeapon_InTheSky:
              break;
            default:
              if (attacker) victim.team = attacker.team;
              victim.enter_frame({ id: victim.data.indexes?.in_the_skys?.[0] });
              break;
          }
      }
    }
    this.targets.length = slow;
  }
}

export class Buff_MagicFlute2 extends Buff {
  constructor(lf2: LF2, id: string) {
    super(lf2, id);
    this.tick.max = 3;
    this.life.max = 2;
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
      slow++;
      const prev_hp = victim.hp;
      victim.hp_r -= injury_r;
      victim.hp -= injury;
      victim.fallinjury = 20;
      victim.toughness = 0;
      if (attacker) summary_mgr.apply_damage(attacker, injury, victim, prev_hp);
    }
    this.targets.length = slow;
  }

  override update(d: number): void {
    super.update(d);

    const attacker = this.world.entity_map.get(this.attacker);

    let slow = 0;
    for (let fast = 0; fast < this.targets.length; ++fast) {
      const vid = this.targets[fast];
      const victim = this.world.entity_map.get(vid);
      if (!victim) continue;
      if (slow !== fast) this.targets[slow] = this.targets[fast];
      slow++;

      const vy = calc_v(victim.velocity.y, 1.5, SpeedMode.AccTo, 1.5, 1)
      victim.set_velocity_y(vy)
      victim.handle_velocity_decay(0.25);
      switch (victim.data.type) {
        case EntityEnum.Fighter:
          if (victim.state !== StateEnum.Falling) {
            victim.enter_frame({ id: victim.data.indexes?.falling?.[-1][0] })
          }
          break;
        case EntityEnum.Weapon:
          switch (victim.state) {
            case StateEnum.Weapon_InTheSky:
            case StateEnum.HeavyWeapon_InTheSky:
              break;
            default:
              if (attacker) victim.team = attacker.team;
              victim.enter_frame({ id: victim.data.indexes?.in_the_skys?.[0] });
              break;
          }
      }
    }
    this.targets.length = slow;
  }
}