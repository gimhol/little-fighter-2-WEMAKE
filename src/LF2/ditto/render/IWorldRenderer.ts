import type { Entity } from "../../entity/Entity";

export interface IWorldRenderer {
  indicators: number;
  add_entity(entity: Entity): void;
  del_entity(entity: Entity): void;
  render(dt: number): void;
  dispose(): void;
}
