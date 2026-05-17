import { l, R } from "react-router/dist/development/index-react-server-client-Da3kmxNd";
import { IState } from "../../../base";
import { O_ID } from "../../../defines/BuiltIn_OID";
import { CMD } from "../../../defines/CMD";
import { Entity } from "../../../entity";
import { round_float } from "../../../utils/math/round_float";
import type { Tests } from "./Tests";

let KEY: number = -1;
export class TestCase implements IState<number> {
  readonly key: number = ++KEY;
  readonly owner: Tests;
  entities: Entity[] = [];
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
  enter(): void {
    this.owner.world.clear();
    this.owner.lf2.change_bg('bg_4');
  }
  leave(): void {
    this.lf2.cmds.push(CMD.DIST_CAM, '')
    this.owner.world.clear();
    this.owner.lf2.change_bg('bg_4');
  }
  spawn(oid: string) {
    const data = this.lf2.datas.find_entity(oid);
    if (!data) return null;
    return this.lf2.factory.create_entity(this.world, data)!;
  }
  spawns(...oids: string[]): Entity[] {
    const ret = [];
    for (const oid of oids) {
      ret.push(this.spawn(oid)!)
    }
    return ret;
  }
  bandits_8(px: number = 50, pz: number = 20): Entity[] {
    return this.around_8(O_ID.Bandit, px, pz)
  }
  around_8(oid: string, px: number = 50, pz: number = 20): Entity[] {
    const ret: Entity[] = []
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
      const e = this.spawn(oid)
      if (!e) break;
      ret.push(e)
      e.set_position(x, 0, z);
      e.attach();
    }
    return ret;
  }
  circle(oid: string, ox: number, oy: number, rw: number, rh: number, count: number): Entity[] {
    const ret: Entity[] = [];
    const d = Math.PI * 2 / count;
    for (let i = 0; i < count; i++) {
      const a = round_float(d * i);
      const x = round_float(ox + Math.cos(a) * rw);
      const z = round_float(oy + Math.sin(a) * rh);
      const e = this.spawn(oid);
      if (!e) break;
      ret.push(e);
      e.set_position(x, 0, z);
      e.attach();
    }
    return ret;
  }
  bandits_mid_8(x = 100, z = 50): Entity[] {
    return this.mid_8(O_ID.Bandit, x, z)
  }
  mid_8(oid: string, x = 100, z = 50): Entity[] {
    const ret: Entity[] = []
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
      const e = this.spawn(oid)
      if (!e) break;
      ret.push(e)
      e.set_position(x, 0, z);
      e.attach();
    }
    return ret;
  }

  hori(oid: string, ox: number, oz: number, w: number, count: number): Entity[] {
    const ret: Entity[] = [];
    const x_list: number[] = [];
    const d = w / (count - 1);
    for (let i = 0; i < count; i++) {
      x_list.push(round_float(ox - w / 2 + d * i))
    }
    x_list.forEach(x => {
      const o = this.spawn(oid);
      if (!o) return;
      o.set_position(x, 0, oz);
      o.attach();
      ret.push(o)
    })
    return ret;
  }

  hori_3(oid: string, rx: number = 250, z = this.midZ): Entity[] {
    return this.hori(oid, this.midX, z, rx * 2, 3);
  }

  hori_2(oid: string, rx: number = 250, z = this.midZ): Entity[] {
    return this.hori(oid, this.midX, z, rx * 2, 2);
  }

  verti(oid: string, ox: number, oz: number, h: number, count: number): Entity[] {
    const ret: Entity[] = [];
    const z_list: number[] = [];
    const d = h / (count - 1);
    for (let i = 0; i < count; i++) {
      z_list.push(round_float(oz - h / 2 + d * i))
    }
    z_list.forEach(z => {
      const o = this.spawn(oid);
      if (!o) return;
      o.set_position(ox, 0, z);
      o.attach();
      ret.push(o)
    })
    return ret;
  }

  verti_3(oid: string, x = this.midX, h = 200): Entity[] {
    return this.verti(oid, x, this.midZ, h, 3);
  }
}
