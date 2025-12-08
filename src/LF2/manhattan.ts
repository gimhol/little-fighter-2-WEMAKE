import { Entity } from "./entity";
import { abs } from "./utils";

export function manhattan(e1: Entity, e2: Entity) {
  const p1 = e1.position;
  const p2 = e2.position;
  return abs(p1.x - p2.x) + abs(p1.z - p2.z);
}
