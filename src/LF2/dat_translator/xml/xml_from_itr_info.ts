import type { IItrInfo } from "../../defines/IItrInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";
import { writeNonZeroAttr } from "./xml_from_write";

/**
 * 序列化 <itr>
 */
export function xml_from_itr_info(xml: IXMLFactory, i: IItrInfo): IXMLElement {
  const el = xml.create("itr");
  if (i.id) el.set_str_attr("id", i.id);
  if (i.name) el.set_str_attr("name", i.name);
  if (i.ref) el.set_str_attr("ref", i.ref);
  if (i.kind !== undefined && i.kind !== 0) el.set_num_attr("kind", i.kind);
  if (i.hit_flag) el.set_num_attr("hit_flag", i.hit_flag);
  writeNonZeroAttr(el, i as any, ["x", "y", "w", "h", "z", "l", "dvx", "dvy", "dvz", "effect", "injury", "vrest", "fall", "arest", "bdefend", "target"]);
  return el;
}
