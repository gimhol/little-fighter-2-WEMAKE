import { BuiltIn_OID, IOpointInfo } from "../defines";
import type { Entity } from "../entity";
import { round } from "../utils";

export function spawn_ice_piece(entity: Entity, id: string): IOpointInfo {
  const { frame, lf2: { mt } } = entity;
  const w = frame.pic?.w || 0;
  const h = frame.pic?.h || 0;
  const facing = mt.pick([-1, 1])

  const x = round(entity.frame.centerx + mt.range(-round(w / 4), round(w / 4)))
  const y = round(entity.frame.centery / 2 + mt.range(-round(h / 2), 0))
  const ret: IOpointInfo = {
    kind: 0,
    x, y,
    oid: BuiltIn_OID.BrokenWeapon,
    action: { id, facing },
    dvx: mt.range(-4, 4),
    dvz: mt.range(-4, 4),
    dvy: mt.range(0, 5),
    is_entity: false,
    speedz: 0,
  }
  return ret;
}
