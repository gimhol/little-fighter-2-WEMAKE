import { type IOpointInfo, type IOpointMulti, opoint_info_new } from "../../defines/IOpointInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { apply_velocity_shorthand } from "./xml_to_frame_info";
import { xml_to_next_frame } from "./xml_to_next_frame";
import { xml_to_opoint_multi } from "./xml_to_opoint_multi";

/**
 * 解析 `<opoint>` 生成点
 */
export function xml_to_opoint(el: IXMLElement): IOpointInfo {
  const o = opoint_info_new();
  const x = el.num_attr("x");
  if (x !== void 0) o.x = x;
  const y = el.num_attr("y");
  if (y !== void 0) o.y = y;
  const z = el.num_attr("z");
  if (z !== void 0) o.z = z;
  const oid = el.str_attr("oid");
  if (oid !== void 0) o.oid = oid;
  const actions = el.children_by_tag("action");
  if (actions.length == 1) {
    o.action = xml_to_next_frame(actions[0]);
  } else if (actions.length > 1) {
    o.action = actions.map(v => xml_to_next_frame(v));
  }
  const multi = el.num_attr("multi");
  if (multi !== void 0) o.multi = multi;
  const multiEl = el.first_by_tag("multi");
  if (multiEl) o.multi = xml_to_opoint_multi(multiEl);

  const spreading = el.num_attr("spreading");
  if (spreading !== void 0) o.spreading = spreading;
  const dvx = el.num_attr("dvx");
  if (dvx !== void 0) o.dvx = dvx;
  const dvy = el.num_attr("dvy");
  if (dvx !== void 0) o.dvy = dvy;
  const dvz = el.num_attr("dvz");
  if (dvx !== void 0) o.dvz = dvz;
  apply_velocity_shorthand(el, o);
  return o;
}
