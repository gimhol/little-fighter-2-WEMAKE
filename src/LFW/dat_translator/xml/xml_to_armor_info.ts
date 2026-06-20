import { armor_Info_new, type IArmorInfo } from "../../defines/IArmorInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";

export function xml_to_armor_info(el: IXMLElement): IArmorInfo {
  const ret = armor_Info_new();
  ret.id = el.get_str("id")
  ret.name = el.get_str("name")
  ret.type = el.get_num("type")
  ret.toughness = el.get_num("toughness")
  ret.fireproof = el.get_num("fireproof")
  ret.antifreeze = el.get_num("antifreeze")
  ret.fulltime = el.get_bool("fulltime")
  ret.injury_ratio = el.get_num("injury_ratio")
  ret.shaking_ratio = el.get_num("shaking_ratio")
  ret.motionless_ratio = el.get_num("motionless_ratio")
  ret.hit_sounds = el.get_str_arr("hit_sounds")
  ret.dead_sounds = el.get_str_arr("dead_sounds")
  return ret;
}
