import { type IBdyInfo, bdy_info_new } from "../../defines/IBdyInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { xml_to_qube } from "./xml_to_frame_info";

/**
 * 解析 `<bdy>` 碰撞体
 */
export function xml_to_bdy_info(el: IXMLElement): IBdyInfo {
  return Object.assign(bdy_info_new(), xml_to_qube(el), {
    kind: el.num_attr("kind") ?? 0,
    hit_flag: el.num_attr("hit_flag"),
    prefab_id: el.str_attr("prefab_id"),
    code: el.str_attr("code"),
  });
}
