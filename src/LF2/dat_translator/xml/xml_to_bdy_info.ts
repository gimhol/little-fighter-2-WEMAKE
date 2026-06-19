import { type IBdyInfo, bdy_info_new } from "../../defines/IBdyInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { xml_to_qube } from "./xml_to_qube";

/**
 * 解析 `<bdy>` 碰撞体
 */
export function xml_to_bdy_info(el: IXMLElement): IBdyInfo {
  const bdy = bdy_info_new();
  Object.assign(bdy, xml_to_qube(el));
  bdy.id = el.str_attr("id");
  bdy.name = el.str_attr("name");
  bdy.kind = el.num_attr("kind") ?? 0;
  bdy.hit_flag = el.num_attr("hit_flag");
  bdy.ref = el.str_attr("ref") ?? el.str_attr("prefab_id");
  bdy.code = el.num_attr("code") ?? el.str_attr("code");
  bdy.test = el.str_attr("test");
  return bdy;
}
