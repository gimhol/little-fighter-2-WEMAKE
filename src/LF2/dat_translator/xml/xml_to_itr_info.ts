import { type IItrInfo, itr_info_new } from "../../defines/IItrInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { apply_velocity_shorthand, merge_by_tag, xml_to_qube } from "./xml_to_frame_info";
import { xml_to_next_frame } from "./xml_to_next_frame";

/**
 * 解析 `<itr>` 攻击框
 */
export function xml_to_itr_info(el: IXMLElement): IItrInfo {
  const itr = itr_info_new();
  Object.assign(itr, xml_to_qube(el));
  itr.id = el.str_attr("id");
  itr.name = el.str_attr("name");
  itr.kind = el.num_attr("kind") ?? 0;
  itr.injury = el.num_attr("injury");
  itr.bdefend = el.num_attr("bdefend");
  itr.motionless = el.num_attr("motionless");
  itr.shaking = el.num_attr("shaking");
  itr.dvx = el.num_attr("dvx");
  itr.dvy = el.num_attr("dvy");
  itr.dvz = el.num_attr("dvz");
  itr.effect = el.num_attr("effect");
  itr.fall = el.num_attr("fall");
  itr.vrest = el.num_attr("vrest");
  itr.arest = el.num_attr("arest");
  itr.hit_flag = el.num_attr("hit_flag");
  itr.ref = el.str_attr("ref") ?? el.str_attr("prefab_id");
  itr.catchingact = merge_by_tag(el, "catchingact", xml_to_next_frame);
  itr.caughtact = merge_by_tag(el, "caughtact", xml_to_next_frame);
  itr.on_hit_ground = merge_by_tag(el, "on_hit_ground", xml_to_next_frame);
  itr.test = el.str_attr("test");
  itr.code = el.num_attr("code") ?? el.str_attr("code");
  apply_velocity_shorthand(el, itr);
  return itr;
}
