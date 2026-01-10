import { IOpointInfo, BuiltIn_OID } from "../defines";
import { Entity } from "../entity";
import { round } from "../utils";


export function spawn_buring_smoke(entity: Entity, foo: 1 | 2): IOpointInfo {
  const { frame, lf2: { mt } } = entity;
  const w = frame.pic?.w || 0;
  const h = frame.pic?.h || 0;
  const facing = mt.pick([-1, 1])
  const ret: IOpointInfo = {
    kind: 0, x: 0, y: 0,
    oid: BuiltIn_OID.BrokenWeapon,
    action: { id: "140", facing },
    speedz: 0,
    is_entity: false,
  };
  switch (foo) {
    case 1:
      ret.x = round(mt.range(round(w / 4), round(3 * w / 4)));
      ret.y = round(frame.centery + mt.range(-round(h / 2), 0));
      break;
    case 2:
      const ww = round(w / 6)
      ret.x = round(frame.centerx + mt.range(-ww, ww));
      ret.y = round(frame.centery + mt.range(-round(3 * h / 4), 0));
      break;
  }
  return ret;
}
