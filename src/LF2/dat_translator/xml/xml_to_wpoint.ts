import { type IWpointInfo, wpoint_info_new } from "../../defines";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";

/**
 * 解析 `<wpoint>` 武器点
 */
export function xml_to_wpoint(el: IXMLElement): IWpointInfo {
  return Object.assign(wpoint_info_new(), {
    kind: el.num_attr("kind") ?? 0,
    x: el.num_attr("x") ?? 0,
    y: el.num_attr("y") ?? 0,
    z: el.num_attr("z") ?? 0,
    weaponact: el.num_attr("weaponact"),
    attacking: el.num_attr("attacking"),
    dvx: el.num_attr("dvx"),
    dvy: el.num_attr("dvy"),
    dvz: el.num_attr("dvz"),
  });
}
