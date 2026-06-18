import type { IOpointMulti } from "../../defines/IOpointInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";

/**
 * 序列化 <multi>（来自 IOpointMulti）
 */
export function xml_from_opoint_multi(xml: IXMLFactory, m: IOpointMulti): IXMLElement {
  const el = xml.create("multi");
  el.set_num_attr("type", m.type);
  if (m.skip_zero !== undefined) el.set_bool_attr("skip_zero", m.skip_zero);
  if (m.min !== undefined) el.set_num_attr("min", m.min);
  if (m.max !== undefined) el.set_num_attr("max", m.max);
  return el;
}
