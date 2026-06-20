import type { ItrKind } from "../defines";
import type { BdyKind } from "../defines/BdyKind";
import type { EntityEnum } from "../defines/EntityEnum";
import type { Collision } from "./Collision";

export interface ICollisionHandler {
  a_type: EntityEnum[];
  itr: ItrKind[];
  v_type: EntityEnum[];
  bdy: BdyKind[];
  run(collision: Collision): any;
}
