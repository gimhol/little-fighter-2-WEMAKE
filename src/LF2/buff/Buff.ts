import { new_id } from "../base";
import type { LF2 } from "../LF2";
import { Times } from "../utils/Times";
import { World } from "../World";

export abstract class Buff {
  static readonly KIND: string | number = '';
  readonly lf2: LF2;
  readonly world: World;
  readonly id: string
  kind: string | number;
  attacker: string = '';
  victims: string[] = [];
  level: number = 0;
  _mounted = false;
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
    this.kind = '';
  }
  abstract job(): void;
  add(target: string): this {
    const e = this.world.entity_map.get(target)
    if (!e) return this;
    this.victims.push(target)
    e.buff.set(this.id, this)
    return this;
  }
  
  del(target: string): this {
    this.victims = this.victims.filter(v => v != target);
    const e = this.world.entity_map.get(target)
    if (!e) return this;
    this.victims.push(target)
    e.buff.delete(this.id)
    return this;
  }

  update(d: number) {
    if (this.tick.add(d)) this.job();
    this.life.add();
  }
  mount(): void {
    if (this._mounted) return;
    this._mounted = true;
    this.world.buffs.set(this.id, this);
    
  }
  unmount() {
    if(!this._mounted) return;
    this._mounted = false;
    for (const victim of this.victims) {
      const e = this.world.entity_map.get(victim)
      if (!e) continue;
      e.buff.delete(this.id)
    }
    this.victims = []
  }
}