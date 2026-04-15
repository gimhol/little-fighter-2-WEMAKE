import { EntityGroup } from "../defines";
import { IEntityData } from "../defines/IEntityData";
import { Entity } from "../entity/Entity";
import { is_weapon } from "../entity/type_check";
import { LF2 } from "../LF2";
import { Randoming } from "./Randoming";

export class WeaponsHelper {
  readonly lf2: LF2;
  readonly random_map = new Map<string, Randoming<IEntityData>>()
  readonly random_d_map = new Map<string, Randoming<IEntityData>>()
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }
  get list(): Entity[] {
    const ret: Entity[] = [];
    this.lf2.world.entities.forEach((v) => is_weapon(v) && ret.push(v));
    return ret;
  }
  get a(): Entity | undefined { return this.at(0) }
  get b(): Entity | undefined { return this.at(1) }
  at(idx: number): Entity | undefined {
    return this.list[idx];
  }

  add(
    data?: IEntityData | string,
    num: number = 1,
    team?: string,
  ): Entity[] {
    if (typeof data === "string") data = this.lf2.datas.find_weapon(data);
    if (!data) return [];
    return this.lf2.entities.add(data, num, team);
  }

  randoms(group: string, duplicate: boolean) {
    const map = duplicate ? this.random_d_map : this.random_map
    let ret = map.get(group);
    if (!ret) {
      let list = this.lf2.datas.weapons;
      if (group) list = list.filter(v => v.base.group?.some(g => g === group))
      if (!list.length) return void 0;
      ret = new Randoming(list, this.lf2, duplicate)
      map.set(group, ret)
    }
    return ret;
  }
  add_random(num = 1, duplicate = false, group: string = ''): Entity[] {
    const randoms = this.randoms(group, duplicate)

    const ret: Entity[] = [];
    if (!randoms) return ret;

    while (--num >= 0) {
      const d = randoms.take();
      if (!d) continue;
      ret.push(...this.add(d, 1));
    }
    return ret;
  }
}
