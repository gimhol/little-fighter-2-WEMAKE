import { Entity } from "../entity";
import { manhattan_xz } from "../helper/manhattan_xz";
import { BotTarget } from "./IBotTarget";

export class NearestTargets {
  max: number;
  targets: BotTarget[] = [];
  entities = new Set<Entity>();

  constructor(max: number) { this.max = max; }

  get(): BotTarget | undefined { return this.targets[0]; }

  look(self: Entity, other: Entity, defendable: number = 0) {
    const { targets } = this;
    if (!self || this.entities.has(other)) return;

    const distance = manhattan_xz(self, other);
    const len = targets.length;
    if (len < this.max) {
      targets.push(new BotTarget({ entity: other, distance, defendable }));
      this.entities.add(other);
      return;
    } else {
      for (let i = 0; i < len; ++i) {
        const target = targets[i];
        if (distance > target.distance)
          continue;
        this.targets.splice(i, 0, new BotTarget({ entity: other, distance, defendable }));
        this.entities.add(other);
        const { entity } = this.targets[this.max];
        this.entities.delete(entity);
        this.targets.length = this.max;
        break;
      }
    }
  }

  del(condition: (target: BotTarget) => boolean) {
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
