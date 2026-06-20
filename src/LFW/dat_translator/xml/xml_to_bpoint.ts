import { type IBpointInfo, bpoint_info_new } from "../../defines";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";

/**
 * 解析 `<bpoint>` 灼烧点
 */
export function xml_to_bpoint(el: IXMLElement): IBpointInfo {
  return Object.assign(bpoint_info_new(), {
    x: el.num_attr("x") ?? 0,
    y: el.num_attr("y") ?? 0,
    z: el.num_attr("z") ?? 0,
    r: el.num_attr("r") ?? 0,
  });
}
