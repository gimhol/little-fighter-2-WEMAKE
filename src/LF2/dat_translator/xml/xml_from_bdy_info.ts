import type { IBdyInfo } from "../../defines/IBdyInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";

/**
 * 序列化 <bdy>
 */
export function xml_from_bdy_info(xml: IXMLFactory, b: IBdyInfo, tag: string = "bdy"): IXMLElement {
  const el = xml.create(tag);
  el.set_str_attr("id", b.id);
  el.set_str_attr("name", b.name);
  el.set_str_attr("ref", b.ref);
  el.set_num_attr("kind", b.kind as number);
  el.set_num_attr("hit_flag", b.hit_flag as number);
  el.set_num_attr("x", b.x);
  el.set_num_attr("y", b.y);
  el.set_num_attr("w", b.w);
  el.set_num_attr("h", b.h);
  el.set_num_attr("z", b.z);
  el.set_num_attr("l", b.l);
  return el;
}
