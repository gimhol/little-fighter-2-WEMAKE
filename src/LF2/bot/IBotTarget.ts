import { Entity } from "../entity";

export interface IBotTarget {
  entity: Entity;
  distance: number;
  defendable: number;
}
export class BotTarget {
  entity: Entity;
  distance: number;
  defendable: number;
  constructor(o: IBotTarget) {
    this.entity = o.entity
    this.distance = o.distance
    this.defendable = o.defendable
  }
  get facing() { return this.entity.facing }
  get x() { return this.entity.position.x }
}