import type { IBdyInfo } from "../../defines/IBdyInfo";
import type { IXML, IXMLElement } from "../../ditto/xml";
import { xml_from_colli_action } from "./xml_from_colli_action";

/**
 * 序列化 <bdy>
 */
export function xml_from_bdy_info(xml: IXML, b: IBdyInfo, tag: string = "bdy"): IXMLElement {
  const el = xml.create(tag);
  el.set_str_attr("id", b.id);
  el.set_str_attr("name", b.name);
  el.set_str_attr("ref", b.ref);
  el.set_num_attr("kind", b.kind as number);
  el.set_num_attr("hit_flag", b.hit_flag as number);
  b.actions?.map(v => xml_from_colli_action(xml, v, "action")).forEach(v => {
    el.insert(v);
  })
  el.set_nums_attr_soft("qube", [b.x, b.y, b.w, b.h, b.z, b.l]);
  el.set_str_attr("test", b.test);
  el.set_num_attr("code", b.code);
  return el;
}
