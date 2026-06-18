import { type ICpointInfo, cpoint_info_new, type TNextFrame } from "../../defines";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { xml_to_next_frame } from "./xml_to_next_frame";

/**
 * 解析 `<cpoint>` 抓取点
 */
export function xml_to_cpoint(el: IXMLElement): ICpointInfo {
  const cp = Object.assign(cpoint_info_new(), {
    kind: el.num_attr("kind"),
    x: el.num_attr("x") ?? 0,
    y: el.num_attr("y") ?? 0,
    z: el.num_attr("z") ?? 0,
    vaction: void 0 as TNextFrame | undefined,
    injury: el.num_attr("injury"),
    hurtable: el.num_attr("hurtable"),
    decrease: el.num_attr("decrease"),
  });
  const vaction = el.first_by_tag("vaction");
  if (vaction) cp.vaction = xml_to_next_frame(vaction);
  return cp;
}
