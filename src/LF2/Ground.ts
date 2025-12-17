import { Entity } from "./entity";

export class Ground {
  static Default: Ground = new Ground()
  objs = new Set<Entity>()
  add(obj: Entity) { this.objs.add(obj) }
  del(obj: Entity) { this.objs.delete(obj) }
  get_y(x: number, y: number, z: number) {
    return 0;
  }
}
