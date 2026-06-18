import type { IOpointInfo } from "../../defines/IOpointInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";
import { xml_from_next_frame } from "./xml_from_next_frame";
import { xml_from_opoint_multi } from "./xml_from_opoint_multi";

/**
 * 序列化 <opoint>
 */
export function xml_from_opoint(xml: IXMLFactory, o: IOpointInfo): IXMLElement {
  const el = xml.create("opoint");
  if (o.id) el.set_str_attr("id", o.id);
  if (o.name) el.set_str_attr("name", o.name);
  if (o.oid !== undefined) el.set_strs_attr("oid", o.oid);

  const actions = Array.isArray(o.action) ? o.action : o.action ? [o.action] : [];
  for (const action of actions) {
    el.insert(xml_from_next_frame(xml, action, 'action'));
  }

  // multi: number → attr; object → <multi> child
  if (typeof o.multi === "object" && o.multi !== null) {
    el.insert(xml_from_opoint_multi(xml, o.multi));
  } else if (typeof o.multi === "number") {
    el.set_num_attr("multi", o.multi);
  }

  el.set_num_attr("x", o.x);
  el.set_num_attr("y", o.y);
  el.set_num_attr("z", o.z);
  el.set_nums_attr_soft("dv", [o.dvx, o.dvy, o.dvz]);
  el.set_num_attr("facing", o.facing as number);
  el.set_num_attr("mp", o.mp);
  return el;
}
