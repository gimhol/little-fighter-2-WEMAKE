import { type IChaseInfo, chase_info_new } from "../../defines";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";

/**
 * 解析 `<chase>` 跟踪
 */
export function xml_to_chase(el: IXMLElement): IChaseInfo {
  return Object.assign(chase_info_new(), {
    stratedy: el.num_attr("stratedy") ?? 0,
    flag: el.num_attr("flag") ?? 0,
    lost: el.num_attr("lost"),
    oy: el.num_attr("oy"),
  });
}
