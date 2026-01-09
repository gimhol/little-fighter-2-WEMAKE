import { BuiltIn_OID, IOpointInfo } from "../defines";
import type { Entity } from "../entity";
import { round } from "../utils";

export function spawn_ice_piece(entity: Entity, id: string): IOpointInfo {
  const { frame } = entity;
  const w = frame.pic?.w || 0;
  const h = frame.pic?.h || 0;

  entity.lf2.mt.mark = 'sip_1'
  const facing = entity.lf2.mt.pick([-1, 1])
  const ret: IOpointInfo = {
    kind: 0,
    x: entity.frame.centerx,
    y: entity.frame.centery / 2,
    oid: BuiltIn_OID.BrokenWeapon,
    action: { id, facing },
    dvx: entity.lf2.mt.range(-4, 4),
    dvz: entity.lf2.mt.range(-4, 4),
    dvy: entity.lf2.mt.range(0, 5),
    is_entity: false,
    speedz: 0,
  };
  entity.lf2.mt.mark = 'sip_2'
  const xx = entity.lf2.mt.range(-round(w / 4), round(w / 4));
  entity.lf2.mt.mark = 'sip_3'
  const yy = entity.lf2.mt.range(-round(h / 2), 0);
  ret.x += xx;
  ret.y += yy;
  return ret;
}
