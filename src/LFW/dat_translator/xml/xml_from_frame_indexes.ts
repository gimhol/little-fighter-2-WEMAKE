import type { IFrameIndexes } from "../../defines/IFrameIndexes";
import type { IXML, IXMLElement } from "../../ditto/xml";

/**
 * 序列化 <indexes>（平铺属性格式，与 xml_to_frame_indexes 对称）
 */
export function xml_from_frame_indexes(xml: IXML, indexes: IFrameIndexes | undefined, tag: string = "indexes"): IXMLElement | null {
  if (!indexes) return null;

  const el = xml.create(tag);

  // -- 单值 --
  el.set_attr("default", indexes.default);
  el.set_attr("heavy_obj_walk", indexes.heavy_obj_walk);
  el.set_attr("landing_1", indexes.landing_1);
  el.set_attr("landing_2", indexes.landing_2);
  el.set_attr("dizzy", indexes.dizzy);
  el.set_attr("picking_heavy", indexes.picking_heavy);
  el.set_attr("picking_light", indexes.picking_light);
  el.set_attr("ice", indexes.ice);
  el.set_attr("on_ground", indexes.on_ground);
  el.set_attr("just_on_ground", indexes.just_on_ground);
  el.set_attr("throw_on_ground", indexes.throw_on_ground);

  // -- 数组 --
  el.set_arr_attr("in_the_skys", indexes.in_the_skys);
  el.set_arr_attr("throwings", indexes.throwings);
  el.set_arr_attr("on_hands", indexes.on_hands);
  el.set_arr_attr("fire", indexes.fire);

  // -- 方向对：_1 → 1, _2 → -1 --
  el.set_arr_attr("falling_1", indexes.falling?.[1]);
  el.set_arr_attr("falling_2", indexes.falling?.[-1]);
  el.set_arr_attr("bouncing_1", indexes.bouncing?.[1]);
  el.set_arr_attr("bouncing_2", indexes.bouncing?.[-1]);
  el.set_arr_attr("critical_hit_1", indexes.critical_hit?.[1]);
  el.set_arr_attr("critical_hit_2", indexes.critical_hit?.[-1]);
  el.set_arr_attr("grand_injured_1", indexes.grand_injured?.[1]);
  el.set_arr_attr("grand_injured_2", indexes.grand_injured?.[-1]);
  el.set_attr("injured_1", indexes.injured?.[1]);
  el.set_attr("injured_2", indexes.injured?.[-1]);
  el.set_attr("lying_1", indexes.lying?.[1]);
  el.set_attr("lying_2", indexes.lying?.[-1]);


  return el;
}
