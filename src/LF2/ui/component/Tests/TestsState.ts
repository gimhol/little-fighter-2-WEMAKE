import { IState } from "@/LF2/base";
import { O_ID } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";
import { Factory } from "@/LF2/entity/Factory";
import { round_float } from "@/LF2/utils/math/round_float";
import { Tests } from ".";

export class TestsState implements IState<number> {
  static KEY: number = 0;
  readonly key: number = 0;
  readonly owner: Tests;

  get lf2() { return this.owner.lf2 }
  get world() { return this.owner.world }
  get bg() { return this.owner.world.bg }

  get left() { return this.world.bg.left; }
  get right() { return this.world.bg.right; }
  get far() { return this.world.bg.far; }
  get near() { return this.world.bg.near; }
  get midX() { return round_float((this.left + this.right) / 2); }
  get midZ() { return round_float((this.near + this.far) / 2); }

  constructor(owner: Tests) {
    this.owner = owner;
  }
  update(dt: number): number | void | undefined {

  }
  enter?(): void {
    this.owner.world.clear();
    this.owner.lf2.change_bg('bg_4');
  }
  leave?(): void {
    this.owner.world.clear();
    this.owner.lf2.change_bg('bg_4');
  }
  spawn(oid: string) {
    const data = this.lf2.datas.find_fighter(oid);
    if (!data) return null;
    return Factory.inst.create_entity(data.type, this.world, data) || null;
  }
  bandits_8(px: number = 50, pz: number = 20): Entity[] {
    const bandits: Entity[] = []
    const x1 = this.left + px;
    const x2 = this.midX;
    const x3 = this.right - px;
    const z1 = this.near - pz;
    const z2 = this.midZ;
    const z3 = this.far + pz;
    const pos = [
      [x1, z1], [x2, z1], [x3, z1], [x3, z2],
      [x3, z3], [x2, z3], [x1, z3], [x1, z2],
    ];
    for (const [x, z] of pos) {
      const bandit = this.spawn(O_ID.Bandit)
      if (!bandit) break;
      bandits.push(bandit)
      bandit.set_position(x, 0, z);
      bandit.attach();
    }
    return bandits;
  }
  bandits_mid_8(x = 100, z = 50): Entity[] {
    const bandits: Entity[] = []
    const x1 = this.midX + x;
    const x2 = this.midX - x;
    const x3 = this.midX;
    const z1 = this.midZ;
    const z2 = this.midZ - z;
    const z3 = this.midZ + z;
    const pos = [
      [x1, z1], [x2, z1], [x3, z1], [x3, z2],
      [x3, z3], [x2, z3], [x1, z3], [x1, z2],
    ];
    for (const [x, z] of pos) {
      const bandit = this.spawn(O_ID.Bandit)
      if (!bandit) break;
      bandits.push(bandit)
      bandit.set_position(x, 0, z);
      bandit.attach();
    }
    return bandits;
  }
}
