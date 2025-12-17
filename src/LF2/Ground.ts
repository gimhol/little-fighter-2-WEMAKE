import { Entity } from "./entity";

export class Ground {
  static Default: Ground = new Ground()
  objs = new Set<Entity>()
  add(obj: Entity) { this.objs.add(obj) }
  del(obj: Entity) { this.objs.delete(obj) }
  get_y(x: number, y: number, z: number) {
    return 0;
    // if (x < 100) return 0;
    // if (x < 300) return Number(((x - 100) / 4).toFixed(4));
    // return 50;
  }
}
