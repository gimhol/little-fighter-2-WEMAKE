import type { IOpointInfo } from "../../defines/IOpointInfo";
import type { IXML, IXMLElement } from "../../ditto/xml";
import { xml_from_next_frame } from "./xml_from_next_frame";
import { xml_from_opoint_multi } from "./xml_from_opoint_multi";

/**
 * 序列化 <opoint>
 */
export function xml_from_opoint(xml: IXML, o: IOpointInfo): IXMLElement {
  const el = xml.create("opoint");
  el.set_str_attr("id", o.id);
  el.set_str_attr("name", o.name);
  el.set_num_attr("kind", o.kind as number);
  el.set_strs_attr("oid", o.oid);

  const actions = Array.isArray(o.action) ? o.action : o.action ? [o.action] : [];
  for (const action of actions) {
    el.insert(xml_from_next_frame(xml, action, 'action'));
  }

  if (typeof o.multi === "object" && o.multi !== null) {
    el.insert(xml_from_opoint_multi(xml, o.multi));
  } else if (typeof o.multi === "number") {
    el.set_num_attr("multi", o.multi);
  }

  el.set_num_attr("x", o.x);
  el.set_num_attr("y", o.y);
  el.set_num_attr("z", o.z);
  el.set_num_attr("origin_type", o.origin_type);
  el.set_nums_attr_soft("dv", [o.dvx, o.dvy, o.dvz]);
  el.set_num_attr("max_hp", o.max_hp);
  el.set_num_attr("hp", o.hp);
  el.set_num_attr("max_mp", o.max_mp);
  el.set_num_attr("mp", o.mp);
  el.set_num_attr("speedz", o.speedz);
  el.set_num_attr("spreading", o.spreading as number);
  el.set_bool_attr("is_entity", o.is_entity);
  el.set_num_attr("interval", o.interval);
  el.set_str_attr("interval_id", o.interval_id);
  el.set_num_attr("interval_mode", o.interval_mode);
  el.set_num_attr("motionless", o.motionless);
  el.set_nums_attr("spreading_x", o.spreading_x);
  el.set_nums_attr("spreading_y", o.spreading_y);
  el.set_nums_attr("spreading_z", o.spreading_z);
  el.set_num_attr("unimportant", o.unimportant);
  el.set_num_attr("delay", o.delay);
  el.set_nums_attr_soft("inherit_speed", [o.inherit_speed_x, o.inherit_speed_y, o.inherit_speed_z]);
  return el;
}
