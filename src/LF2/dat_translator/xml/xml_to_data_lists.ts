import type { IDataLists } from "../../defines/IDataLists";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { xml_to_dat_index } from "./xml_to_dat_index";

/**
 * 解析 <data> → IDataLists
 */
export function xml_to_data_lists(el: IXMLElement): IDataLists {
  return {
    objects: el.children_by_tag("obj").map(xml_to_dat_index),
    backgrounds: el.children_by_tag("background").map(xml_to_dat_index),
    stages: el.children_by_tag("stages").map(xml_to_dat_index),
    bots: el.children_by_tag("bot").map(xml_to_dat_index),
  };
}
