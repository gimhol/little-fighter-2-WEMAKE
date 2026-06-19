import type { IArmorInfo } from "../../defines/IArmorInfo";
import type { IXMLElement, IXML } from "../../ditto/xml";

/**
 * 序列化 <armor>
 */
export function xml_from_armor_info(xml: IXML, a: IArmorInfo): IXMLElement {
  const el = xml.create("armor");
  el.set_str_attr("id", a.id);
  el.set_str_attr("name", a.name);
  el.set_str_attr("type", a.type as string);
  el.set_num_attr("toughness", a.toughness);
  el.set_num_attr("fireproof", a.fireproof);
  el.set_num_attr("antifreeze", a.antifreeze);
  el.set_bool_attr("fulltime", a.fulltime);
  el.set_num_attr("injury_ratio", a.injury_ratio);
  el.set_num_attr("shaking_ratio", a.shaking_ratio);
  el.set_num_attr("motionless_ratio", a.motionless_ratio);
  el.set_strs_attr("hit_sounds", a.hit_sounds);
  el.set_strs_attr("dead_sounds", a.dead_sounds);
  return el;
}
