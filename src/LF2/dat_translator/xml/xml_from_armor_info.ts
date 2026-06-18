import type { IArmorInfo } from "../../defines/IArmorInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";
import { writeNonZeroAttr } from "./xml_from_write";

/**
 * 序列化 <armor>
 */
export function xml_from_armor_info(xml: IXMLFactory, a: IArmorInfo): IXMLElement {
  const el = xml.create("armor");
  if (a.id) el.set_str_attr("id", a.id);
  if (a.name) el.set_str_attr("name", a.name);
  writeNonZeroAttr(el, a as any, ["hp", "mp", "armor"]);
  return el;
}
