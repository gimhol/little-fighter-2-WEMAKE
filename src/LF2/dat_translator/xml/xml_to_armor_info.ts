import { armor_Info_new, type IArmorInfo } from "../../defines/IArmorInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";

export function xml_to_armor_info(el: IXMLElement): IArmorInfo {
  const ret = armor_Info_new();
  ret.type = el.get_num("type")
  ret.toughness = el.num_attr("toughness")
  ret.hit_sounds = el.strs_attr("hit_sounds")
  ret.dead_sounds = el.strs_attr("dead_sounds")
  ret.fireproof = el.num_attr("fireproof")
  ret.antifreeze = el.num_attr("antifreeze")
  ret.fulltime = el.bool_attr("fulltime")
  ret.injury_ratio = el.num_attr("injury_ratio")
  ret.shaking_ratio = el.num_attr("shaking_ratio")
  ret.motionless_ratio = el.num_attr("motionless_ratio")
  return ret;
}
