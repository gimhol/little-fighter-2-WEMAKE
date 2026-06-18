import { type IOpointInfo, opoint_info_new } from "../defines";
import type { IXMLElement } from "../ditto";
import { xml_to_qube, xml_to_next_frame, apply_velocity_shorthand } from "./xml_to_frame_info";

/**
 * 解析 `<opoint>` 生成点
 */
export function xml_to_opoint(el: IXMLElement): IOpointInfo {
  const o = Object.assign(opoint_info_new(), xml_to_qube(el));
  const oid = el.str_attr("oid");
  if (oid !== void 0) o.oid = oid;
  const actionEl = el.first_by_tag("action");
  if (actionEl) o.action = xml_to_next_frame(actionEl);
  const multi = el.num_attr("multi");
  if (multi !== void 0) o.multi = multi;
  const spreading = el.num_attr("spreading");
  if (spreading !== void 0) o.spreading = spreading;
  o.dvx = el.num_attr("dvx") ?? 0;
  o.dvy = el.num_attr("dvy") ?? 0;
  o.dvz = el.num_attr("dvz") ?? 0;
  apply_velocity_shorthand(el, o);
  return o;
}
