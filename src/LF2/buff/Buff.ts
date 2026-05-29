import { new_id } from "../base";
import type { LF2 } from "../LF2";
import { Times } from "../utils/Times";
import { World } from "../World";

export abstract class Buff {
  readonly lf2: LF2;
  readonly world: World;
  readonly id: string
  attacker: string = '';
  targets: string[] = [];
  level: number = 0;
  readonly tick = new Times();
  readonly life = new Times(0, 1).set_lifes(1);

  get dead() { return this.life.remains == 0 }
  get lifetime() { return this.life.value }
  set lifetime(v) { this.life.value = v }
  get duration() { return this.life.max }
  set duration(v) { this.life.max = v }
  constructor(lf2: LF2, id: string) {
    this.lf2 = lf2;
    this.world = lf2.world;
    this.id = id;
  }
  abstract job(): void;

  add(target: string): this {
    const e = this.world.entity_map.get(target)
    if (!e) return this;
    this.targets.push(target)
    e.buff.set(this.id, this)
    return this;
  }

  del(target: string): this {
    this.targets = this.targets.filter(v => v != target);
    const e = this.world.entity_map.get(target)
    if (!e) return this;
    this.targets.push(target)
    e.buff.delete(this.id)
    return this;
  }

  update(d: number) {
    if (this.tick.add(d)) this.job();
    this.life.add();
  }

  unmount() {
    for (const target of this.targets) {
      const e = this.world.entity_map.get(target)
      if (!e) continue;
      e.buff.delete(this.id)
    }
    this.targets = []
  }
}