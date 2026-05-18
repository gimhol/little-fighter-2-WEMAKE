import type { Entity } from "../../entity/Entity";

export interface IWorldRenderer {
  get cam_x(): number;
  set cam_x(v: number);
  get cam_y(): number;
  set cam_y(v: number);
  
  indicators: number;
  add_entity(entity: Entity): void;
  del_entity(entity: Entity): void;
  render(dt: number): void;
  dispose(): void;
}
