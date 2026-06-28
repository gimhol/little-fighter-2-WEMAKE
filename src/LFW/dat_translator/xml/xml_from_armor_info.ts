import type { IArmorInfo } from "../../defines/IArmorInfo";
import type { IXMLElement, IXML } from "../../ditto/xml";

/**
 * 序列化 <armor>
 */
export function xml_from_armor_info(xml: IXML, a: IArmorInfo): IXMLElement {
  const el = xml.create("armor");
  el.set_attr("id", a.id);
  el.set_attr("name", a.name);
  el.set_attr("type", a.type);
  el.set_attr("toughness", a.toughness);
  el.set_attr("fireproof", a.fireproof);
  el.set_attr("antifreeze", a.antifreeze);
  el.set_attr("fulltime", a.fulltime);
  el.set_attr("injury_ratio", a.injury_ratio);
  el.set_attr("shaking_ratio", a.shaking_ratio);
  el.set_attr("motionless_ratio", a.motionless_ratio);
  el.set_arr_attr("hit_sounds", a.hit_sounds);
  el.set_arr_attr("dead_sounds", a.dead_sounds);
  return el;
}
