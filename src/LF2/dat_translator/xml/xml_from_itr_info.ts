import type { IItrInfo } from "../../defines/IItrInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";
import { xml_from_next_frame } from "./xml_from_next_frame";

/**
 * 序列化 <itr>
 */
export function xml_from_itr_info(xml: IXMLFactory, i: IItrInfo, tag: string = "itr"): IXMLElement {
  const el = xml.create(tag);
  el.set_str_attr("id", i.id);
  el.set_str_attr("name", i.name);
  el.set_str_attr("ref", i.ref);
  el.set_num_attr("kind", i.kind as number);
  el.set_num_attr("hit_flag", i.hit_flag as number);
  el.set_num_attr("x", i.x);
  el.set_num_attr("y", i.y);
  el.set_num_attr("w", i.w);
  el.set_num_attr("h", i.h);
  el.set_num_attr("z", i.z);
  el.set_num_attr("l", i.l);
  el.set_nums_attr_soft("dv", [i.dvx, i.dvy, i.dvz]);
  el.set_num_attr("effect", i.effect as number);
  el.set_num_attr("injury", i.injury);
  el.set_num_attr("vrest", i.vrest);
  el.set_num_attr("fall", i.fall);
  el.set_num_attr("arest", i.arest);
  el.set_num_attr("bdefend", i.bdefend);
  el.set_num_attr("motionless", i.motionless);
  el.set_num_attr("shaking", i.shaking);
  el.set_str_attr("test", i.test);
  el.set_str_attr("code", i.code != null ? String(i.code) : void 0);

  if (i.catchingact) {
    const list = Array.isArray(i.catchingact) ? i.catchingact : [i.catchingact];
    for (const nf of list) el.insert(xml_from_next_frame(xml, nf, "catchingact"));
  }
  if (i.caughtact) {
    const list = Array.isArray(i.caughtact) ? i.caughtact : [i.caughtact];
    for (const nf of list) el.insert(xml_from_next_frame(xml, nf, "caughtact"));
  }
  if (i.on_hit_ground) {
    const list = Array.isArray(i.on_hit_ground) ? i.on_hit_ground : [i.on_hit_ground];
    for (const nf of list) el.insert(xml_from_next_frame(xml, nf, "on_hit_ground"));
  }

  return el;
}
