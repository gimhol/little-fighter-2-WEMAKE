import { IState } from "@/LF2/base";
import { O_ID } from "@/LF2/defines";
import { CMD } from "@/LF2/defines/CMD";
import { Entity } from "@/LF2/entity";
import { round_float } from "@/LF2/utils/math/round_float";
import type { Tests } from "./Tests";

export class TestCase implements IState<number> {
  static KEY: number = 0;
  readonly key: number = 0;
  readonly owner: Tests;
  name: string = 'None';
  get lf2() { return this.owner.lf2 }
  get world() { return this.owner.world }
  get bg() { return this.owner.world.bg }
  get fsm() { return this.owner.fsm }
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
    this.lf2.cmds.push(CMD.LOCK_CAM, '')
    this.owner.world.clear();
    this.owner.lf2.change_bg('bg_4');
  }
  spawn(oid: string) {
    const data = this.lf2.datas.find_fighter(oid);
    if (!data) return null;
    return this.lf2.factory.create_entity(this.world, data) || null;
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
    const x2 = this.midX;
    const x3 = this.midX - x;
    const z1 = this.midZ - z;
    const z2 = this.midZ;
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
  hori_3(oid: string, x = 250, z = this.midZ): Entity[] {
    const ret: Entity[] = [];
    [this.midX - x, this.midX, this.midX + x].forEach(x => {
      const o = this.spawn(oid);
      if (!o) return;
      o.set_position(x, 0, z);
      o.attach();
      ret.push(o)
    })
    return ret;
  }
  verti_3(oid: string, x = this.midX, z = 100): Entity[] {
    const ret: Entity[] = [];
    [this.midZ - z, this.midZ, this.midZ + z].forEach(z => {
      const o = this.spawn(oid);
      if (!o) return;
      o.set_position(x, 0, z);
      o.attach();
      ret.push(o)
    })
    return ret;
  }
}
