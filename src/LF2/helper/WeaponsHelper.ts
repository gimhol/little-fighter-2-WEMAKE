import { IEntityData } from "../defines/IEntityData";
import { Entity } from "../entity/Entity";
import { is_weapon } from "../entity/type_check";
import { EntitiesHelper } from "./EntitiesHelper";
import { Randoming } from "./Randoming";

export class WeaponsHelper extends EntitiesHelper {
  readonly random_map = new Map<string, Randoming<IEntityData>>()
  readonly random_d_map = new Map<string, Randoming<IEntityData>>()
  override get all(): Entity[] {
    const ret: Entity[] = [];
    this.lf2.world.entities.forEach((v) => is_weapon(v) && ret.push(v));
    return ret;
  }
  override add(
    data?: IEntityData | string,
    num: number = 1,
    team?: string,
  ): Entity[] {
    if (typeof data === "string") 
      data = this.lf2.datas.find_weapon(data);
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
