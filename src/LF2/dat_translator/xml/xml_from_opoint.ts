import type { IOpointInfo } from "../../defines/IOpointInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";
import { writeNonZeroAttr } from "./xml_from_write";

/**
 * 序列化 <opoint>
 */
export function xml_from_opoint(xml: IXMLFactory, o: IOpointInfo): IXMLElement {
  const el = xml.create("opoint");
  if (o.id) el.set_str_attr("id", o.id);
  if (o.name) el.set_str_attr("name", o.name);
  if (o.oid !== undefined) el.set_num_attr("oid", o.oid);
  writeNonZeroAttr(el, o as any, ["x", "y", "z", "dvx", "dvy", "dvz", "action", "facing", "mp"]);
  return el;
}
