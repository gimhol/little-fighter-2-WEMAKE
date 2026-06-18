import type { IOpointInfo } from "../../defines/IOpointInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";
import { xml_from_next_frame } from "./xml_from_next_frame";
import { writeNonZeroAttr } from "./xml_from_write";

/**
 * 序列化 <opoint>
 */
export function xml_from_opoint(xml: IXMLFactory, o: IOpointInfo): IXMLElement {
  const el = xml.create("opoint");
  if (o.id) el.set_str_attr("id", o.id);
  if (o.name) el.set_str_attr("name", o.name);
  if (o.oid !== undefined) el.set_strs_attr("oid", o.oid);

  const actions = Array.isArray(o.action) ? o.action : o.action ? [o.action] : []
  for (const action of actions) {
    el.insert(
      xml_from_next_frame(xml, action, 'action')
    )
  }

  writeNonZeroAttr(el, o as any, ["x", "y", "z", "dvx", "dvy", "dvz", "facing", "mp"]);
  return el;
}
