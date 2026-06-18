import type { IBdyInfo } from "../../defines/IBdyInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";
import { writeNonZeroAttr } from "./xml_from_write";

/**
 * 序列化 <bdy>
 */
export function xml_from_bdy_info(xml: IXMLFactory, b: IBdyInfo): IXMLElement {
  const el = xml.create("bdy");
  if (b.id) el.set_str_attr("id", b.id);
  if (b.name) el.set_str_attr("name", b.name);
  if (b.ref) el.set_str_attr("ref", b.ref);
  if (b.kind !== undefined && b.kind !== 0) el.set_num_attr("kind", b.kind);
  if (b.hit_flag) el.set_num_attr("hit_flag", b.hit_flag);
  writeNonZeroAttr(el, b as any, ["x", "y", "w", "h", "z", "l"]);
  return el;
}
