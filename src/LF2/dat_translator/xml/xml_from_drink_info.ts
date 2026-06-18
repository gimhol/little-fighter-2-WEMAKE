import type { IDrinkInfo } from "../../defines/IDrinkInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";
import { writeNonZeroAttr } from "./xml_from_write";

/**
 * 序列化 <drink>
 */
export function xml_from_drink_info(xml: IXMLFactory, d: IDrinkInfo): IXMLElement {
  const el = xml.create("drink");
  if (d.id) el.set_str_attr("id", d.id);
  if (d.name) el.set_str_attr("name", d.name);
  writeNonZeroAttr(el, d as any, ["hp", "mp", "hp_h", "mp_h"]);
  return el;
}
