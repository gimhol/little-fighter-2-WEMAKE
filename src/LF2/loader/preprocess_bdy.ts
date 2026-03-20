import { Expression } from "../base/Expression";
import { IBdyInfo, IEntityData } from "../defines";
import type { LF2 } from "../LF2";
import { get_val_geter_from_collision } from "./get_val_from_collision";
import { preprocess_action } from "./preprocess_action";

export function preprocess_bdy(lf2: LF2, bdy: IBdyInfo, data: IEntityData, jobs: Promise<void>[]): IBdyInfo {
  const prefab = bdy.prefab_id ? data.bdy_prefabs?.[bdy.prefab_id] : void 0;
  if (prefab) bdy = { ...prefab, ...bdy };
  bdy.tester = bdy.test ? new Expression(
    bdy.test,
    get_val_geter_from_collision
  ) : void 0;
  bdy.actions?.forEach((n, i, l) => l[i] = preprocess_action(lf2, n, jobs));
  return bdy;
}

preprocess_bdy.TAG = 'preprocess_bdy'