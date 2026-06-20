import type { IDrinkInfo } from "../../defines/IDrinkInfo";
import type { IXMLElement, IXML } from "../../ditto/xml";

/**
 * 序列化 <drink>
 */
export function xml_from_drink_info(xml: IXML, d: IDrinkInfo): IXMLElement {
  const el = xml.create("drink");
  el.set_str_attr("id", d.id);
  el.set_str_attr("name", d.name);
  el.set_nums_attr_soft("hp_h", [d.hp_h_total, d.hp_h_value, d.hp_h_ticks]);
  el.set_nums_attr_soft("hp_r", [d.hp_r_total, d.hp_r_value, d.hp_r_ticks]);
  el.set_nums_attr_soft("mp_h", [d.mp_h_total, d.mp_h_value, d.mp_h_ticks]);
  return el;
}
