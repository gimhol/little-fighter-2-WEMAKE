import { Entity } from "../entity";
import { manhattan_xz } from "../helper/manhattan_xz";
import { IBotTarget } from "./IBotTarget";

export class NearestTargets {
  targets: IBotTarget[] = [];
  max: number;
  entities = new Set<Entity>();

  constructor(max: number) { this.max = max; }

  get(): IBotTarget | undefined { return this.targets[0]; }

  look(self: Entity, other: Entity, defendable: number = 0) {
    const { targets } = this;
    if (!self || this.entities.has(other)) return;

    const distance = manhattan_xz(self, other);
    const len = targets.length;
    if (len < this.max) {
      targets.push({ entity: other, distance, defendable });
      this.entities.add(other);
      return;
    } else {
      for (let i = 0; i < len; ++i) {
        const target = targets[i];
        if (distance > target.distance)
          continue;
        this.targets.splice(i, 0, { entity: other, distance, defendable });
        this.entities.add(other);
        const { entity } = this.targets[this.max];
        this.entities.delete(entity);
        this.targets.length = this.max;
        break;
      }
    }
  }

  del(condition: (target: IBotTarget) => boolean) {
    this.targets = this.targets.filter((target) => {
      const ret = !condition(target);
      if (!ret) this.entities.delete(target.entity);
      return ret;
    });
  }

  sort(self: Entity) {
    this.targets.sort((a, b) => {
      a.distance = manhattan_xz(self, a.entity);
      b.distance = manhattan_xz(self, b.entity);
      return a.distance - b.distance;
    });
  }
}
