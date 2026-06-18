import { armor_Info_new, type IArmorInfo } from "../../defines/IArmorInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";

export function xml_to_armor_info(el: IXMLElement): IArmorInfo {
  return Object.assign(armor_Info_new(), {
    type: el.str_attr("type") ?? el.num_attr("type"),
    toughness: el.num_attr("toughness"),
    hit_sounds: el.strs_attr("hit_sounds"),
    dead_sounds: el.strs_attr("dead_sounds"),
    fireproof: el.num_attr("fireproof"),
    antifreeze: el.num_attr("antifreeze"),
    fulltime: el.bool_attr("fulltime"),
    injury_ratio: el.num_attr("injury_ratio"),
    shaking_ratio: el.num_attr("shaking_ratio"),
    motionless_ratio: el.num_attr("motionless_ratio"),
  });
}
