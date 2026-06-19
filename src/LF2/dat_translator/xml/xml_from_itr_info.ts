import type { IItrInfo } from "../../defines/IItrInfo";
import type { IXMLElement, IXML } from "../../ditto/xml";
import { xml_from_colli_action } from "./xml_from_colli_action";
import { xml_from_next_frame, xml_from_t_next_frame } from "./xml_from_next_frame";

/**
 * 序列化 <itr>
 */
export function xml_from_itr_info(xml: IXML, i: IItrInfo, tag: string = "itr"): IXMLElement {
  const el = xml.create(tag);
  el.set_str_attr("id", i.id);
  el.set_str_attr("name", i.name);
  el.set_str_attr("ref", i.ref);
  el.set_num_attr("hit_flag", i.hit_flag as number);
  el.set_num_attr("motionless", i.motionless);
  el.set_num_attr("shaking", i.shaking);
  el.set_num_attr("kind", i.kind);
  el.set_num_attr("fall", i.fall);
  el.set_num_attr("vrest", i.vrest);
  el.set_num_attr("arest", i.arest);
  el.set_num_attr("bdefend", i.bdefend);
  el.set_num_attr("injury", i.injury);
  el.set_num_attr("effect", i.effect);

  xml_from_t_next_frame(xml, i.catchingact, 'catchingact').forEach(v => {
    el.insert(v);
  })
  xml_from_t_next_frame(xml, i.caughtact, 'caughtact').forEach(v => {
    el.insert(v);
  })
  xml_from_t_next_frame(xml, i.on_hit_ground, 'on_hit_ground').forEach(v => {
    el.insert(v);
  })
  i.actions?.map(v => xml_from_colli_action(xml, v, "action")).forEach(v => {
    el.insert(v);
  })
  el.set_nums_attr_soft("qube", [i.x, i.y, i.w, i.h, i.z, i.l]);
  el.set_nums_attr_soft("dv", [i.dvx, i.dvy, i.dvz]);
  el.set_str_attr("test", i.test);
  el.set_str_attr("code", i.code != null ? String(i.code) : void 0);
  return el;
}
