import { IOpointInfo, BuiltIn_OID } from "../defines";
import { Entity } from "../entity";
import { round } from "../utils";


export function spawn_buring_smoke(entity: Entity, foo: 1 | 2): IOpointInfo {
  const { frame } = entity;
  const w = frame.pic?.w || 0;
  const h = frame.pic?.h || 0;
  entity.lf2.mt.mark = 'sbs_1'
  const facing = entity.lf2.mt.pick([-1, 1])
  const ret: IOpointInfo = {
    kind: 0,
    x: frame.centerx,
    y: frame.centery,
    oid: BuiltIn_OID.BrokenWeapon,
    action: { id: "140", facing },
    // dvx: entity.lf2.random_in(-2, 2),
    speedz: 0,
    is_entity: false,
  };
  switch (foo) {
    case 1: {
      entity.lf2.mt.mark = 'sbs_2'
      const xx = entity.lf2.mt.range(round(w / 4), round(3 * w / 4));
      entity.lf2.mt.mark = 'sbs_3'
      const yy = entity.lf2.mt.range(-round(h / 2), 0);
      ret.x = xx;
      ret.y += yy;
      break;
    }
    case 2: {
      entity.lf2.mt.mark = 'sbs_4'
      const xx = entity.lf2.mt.range(-round(w / 6), round(w / 6));
      entity.lf2.mt.mark = 'sbs_5'
      const yy = entity.lf2.mt.range(-round(3 * h / 4), 0);
      ret.x += xx;
      ret.y += yy;
      break;
    }
  }


  return ret;
}
