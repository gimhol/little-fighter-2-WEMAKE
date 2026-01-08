
import { EntityGroup, IEntityData } from "../defines";
import { Entity } from "../entity/Entity";
import { is_fighter } from "../entity/type_check";
import { LF2 } from "../LF2";

export class CharactersHelper {
  readonly lf2: LF2;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }
  list(): Entity[] {
    const ret: Entity[] = [];
    this.lf2.world.entities.forEach((v) => is_fighter(v) && ret.push(v));
    return ret;
  }
  at(idx: number): Entity | undefined {
    return this.list()[idx];
  }
  add(
    data: IEntityData | string | undefined,
    num: number,
    team?: string,
  ): Entity[] {
    if (typeof data === "string") data = this.lf2.datas.find_character(data);
    if (!data) return [];
    return this.lf2.entities.add(data, num, team);
  }
  add_random(num = 1, team?: string, filter?: (e: IEntityData) => boolean): Entity[] {
    const ret: Entity[] = [];
    while (--num >= 0) {
      const d = this.lf2.random_get(
        this.lf2.datas.fighters.filter(v => {
          return filter ? filter(v) : true
        })
      );
      if (!d) continue;
      ret.push(...this.add(d, 1, team));
    }
    return ret;
  }
}
