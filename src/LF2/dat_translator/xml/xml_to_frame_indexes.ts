import { type IFrameIndexes, frame_indexes_new } from "@/LF2/defines";
import type { IXMLElement } from "@/LF2/ditto";



export function xml_to_frame_indexes(el: IXMLElement | undefined): IFrameIndexes | undefined {
  if (!el) return void 0;
  const ret: IFrameIndexes = frame_indexes_new();

  ret.standing = el.get_str("standing", ret.standing);
  ret.heavy_obj_walk = el.get_str_arr("heavy_obj_walk", ret.heavy_obj_walk);
  ret.landing_1 = el.get_str("landing_1", ret.landing_1);
  ret.landing_2 = el.get_str("landing_2", ret.landing_2);
  ret.dizzy = el.get_str("dizzy", ret.dizzy);
  ret.picking_heavy = el.get_str("picking_heavy", ret.picking_heavy);
  ret.picking_light = el.get_str("picking_light", ret.picking_light);

  ret.in_the_skys = el.get_str_arr("in_the_skys", ret.in_the_skys);
  ret.throwings = el.get_str_arr("throwings", ret.throwings);
  ret.on_hands = el.get_str_arr("on_hands", ret.on_hands);

  {
    const a = el.get_str_arr("falling_1");
    const b = el.get_str_arr("falling_2");
    if (!a || !b) return;
    ret.falling = { [1]: a, [-1]: b };
  }
  {
    const a = el.get_str_arr("bouncing_1");
    const b = el.get_str_arr("bouncing_2");
    if (!a || !b) return;
    ret.bouncing = { [1]: a, [-1]: b };
  }
  {
    const a = el.get_str("injured_1");
    const b = el.get_str("injured_2");
    if (!a || !b) return;
    ret.injured = { [1]: a, [-1]: b };
  }
  {
    const a = el.get_str_arr("critical_hit_1");
    const b = el.get_str_arr("critical_hit_2");
    if (!a || !b) return;
    ret.critical_hit = { [1]: a, [-1]: b };
  }
  {
    const a = el.get_str_arr("grand_injured_1");
    const b = el.get_str_arr("grand_injured_2");
    if (!a || !b) return;
    ret.grand_injured = { [1]: a, [-1]: b };
  }
  {
    const a = el.get_str("lying_1");
    const b = el.get_str("lying_2");
    if (!a || !b) return;
    ret.lying = { [1]: a, [-1]: b };
  }
  ret.fire = el.get_str_arr("fire", ret.fire);
  ret.ice = el.get_str("ice", ret.ice);
  ret.on_ground = el.get_str("on_ground", ret.on_ground);
  ret.just_on_ground = el.get_str("just_on_ground", ret.just_on_ground);
  ret.throw_on_ground = el.get_str("throw_on_ground", ret.throw_on_ground);
  for (const key in ret)
    if ((ret as any)[key] == void 0)
      delete (ret as any)[key];
  return Object.keys(ret).length ? ret : void 0;
}
