import { type IItrInfo, itr_info_new } from "../defines";
import type { IXMLElement } from "../ditto";
import { xml_to_qube, merge_by_tag, xml_to_next_frame, apply_velocity_shorthand } from "./xml_to_frame_info";

/**
 * 解析 `<itr>` 攻击框
 */
export function xml_to_itr_info(el: IXMLElement): IItrInfo {
  const itr = Object.assign(itr_info_new(), xml_to_qube(el), {
    kind: el.num_attr("kind") ?? 0,
    injury: el.num_attr("injury"),
    bdefend: el.num_attr("bdefend"),
    motionless: el.num_attr("motionless"),
    shaking: el.num_attr("shaking"),
    dvx: el.num_attr("dvx"),
    dvy: el.num_attr("dvy"),
    dvz: el.num_attr("dvz"),
    effect: el.num_attr("effect"),
    catchingact: el.num_attr("catchingact"),
    caughtact: el.num_attr("caughtact"),
    hit_flag: el.num_attr("hit_flag"),
    on_hit_ground: merge_by_tag(el, "on_hit_ground", xml_to_next_frame),
    actions: void 0,
  });
  apply_velocity_shorthand(el, itr);
  return itr;
}
