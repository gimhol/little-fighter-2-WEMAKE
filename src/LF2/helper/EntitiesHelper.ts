import { new_team } from "../base";
import { IEntityData } from "../defines";
import { TeamEnum } from "../defines/TeamEnum";
import { Factory } from "../entity";
import { Entity } from "../entity/Entity";
import { LF2 } from "../LF2";
import { Randoming } from "./Randoming";

export class EntitiesHelper {
  readonly lf2: LF2;
  readonly team_randoming: Randoming<TeamEnum>;

  constructor(lf2: LF2) {
    this.lf2 = lf2;
    this.team_randoming = new Randoming([
      TeamEnum.Team_1,
      TeamEnum.Team_2,
      TeamEnum.Team_3,
      TeamEnum.Team_4,
    ], this.lf2)
  }

  list(): Entity[] {
    const ret: Entity[] = [];
    this.lf2.world.entities.forEach((v) => ret.push(v));
    return ret;
  }
  
  at(idx: number): Entity | undefined {
    return this.list()[idx];
  }

  add(data: IEntityData, num: number = 1, team?: string): Entity[] {
    const creator = Factory.inst.get_entity_creator(data.type);
    if (!creator) return [];
    const ret: Entity[] = [];
    while (--num >= 0) {
      const entity = creator(this.lf2.world, data);
      entity.ctrl = Factory.inst.create_ctrl(entity.data.id, "", entity)
      entity.team = team === '?' ? this.team_randoming.take() : (team || new_team())
      this.lf2.random_entity_info(entity).attach();
      ret.push(entity);
    }
    return ret;
  }
  del_all() {
    this.lf2.world.del_entities(Array.from(this.lf2.world.entities));
  }
}
