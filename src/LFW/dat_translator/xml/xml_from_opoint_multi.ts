import type { IOpointMulti } from "../../defines/IOpointInfo";
import type { IXMLElement, IXML } from "../../ditto/xml";
/**
 * 序列化 <multi>（来自 IOpointMulti）
 */
export function xml_from_opoint_multi(xml: IXML, m: IOpointMulti): IXMLElement {
  const el = xml.create("multi");
  el.set_attr("type", m.type);
  if (m.skip_zero !== undefined) el.set_attr("skip_zero", m.skip_zero);
  if (m.min !== undefined) el.set_attr("min", m.min);
  if (m.max !== undefined) el.set_attr("max", m.max);
  return el;
}
