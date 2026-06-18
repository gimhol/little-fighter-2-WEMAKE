import { type IOpointInfo, IOpointMulti, opoint_info_new } from "../../defines/IOpointInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { apply_velocity_shorthand, merge_by_tag, xml_to_qube } from "./xml_to_frame_info";
import { xml_to_next_frame } from "./xml_to_next_frame";

/**
 * 解析 `<opoint>` 生成点
 */
export function xml_to_opoint(el: IXMLElement): IOpointInfo {
  const o = Object.assign(opoint_info_new(), xml_to_qube(el));
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

  const multi2 = merge_by_tag<Partial<IOpointMulti>>(el, 'multi', (el) => {
    const ret: Partial<IOpointMulti> = {};
    const type = el.num_attr('type')
    if (type == void 0) return ret;
    const skip_zero = el.bool_attr('skip_zero')
    if (skip_zero !== void 0) ret.skip_zero = skip_zero;
    const min = el.num_attr('min')
    if (min !== void 0) ret.min = min;
    const max = el.num_attr('min')
    if (max !== void 0) ret.max = max;
    return ret;
  })
  if (multi2 !== void 0) o.multi = multi2 as IOpointMulti; // FIXME

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
