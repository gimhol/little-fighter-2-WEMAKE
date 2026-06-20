import { type IBdyInfo, bdy_info_new } from "../../defines/IBdyInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { xml_to_colli_action } from "./xml_to_colli_action";
import { xml_to_qube } from "./xml_to_qube";

export function xml_to_bdy_info(el: IXMLElement): IBdyInfo {
  const ret = bdy_info_new();
  ret.id = el.get_str("id", ret.id);
  ret.name = el.get_str("name", ret.name);
  ret.ref = el.get_str("ref") ?? el.get_str("prefab_id") ?? ret.ref;
  ret.hit_flag = el.get_num("hit_flag", ret.hit_flag);
  ret.kind = el.get_num("kind", ret.kind);
  ret.actions = el.children_by_tag('action').map(xml_to_colli_action)
  if (!ret.actions.length) delete ret.actions;
  ret.test = el.get_str("test", ret.test);
  ret.code = el.get_num("code", ret.code);
  xml_to_qube(el, ret);
  return ret;
}
