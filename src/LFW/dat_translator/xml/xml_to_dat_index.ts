import { DatTypeEnum, type IDatIndex } from "../../defines/IDatIndex";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";

/**
 * 解析 <dat_index>
 */
export function xml_to_dat_index(el: IXMLElement): IDatIndex {
  return {
    id: el.str_attr("id") ?? "",
    type: (el.str_attr("type") ?? "") as DatTypeEnum,
    file: el.str_attr("file") ?? "",
    hash: el.str_attr("hash"),
    alias: el.str_attr("alias"),
    groups: el.strs_attr("groups"),
    skipped: el.str_attr("skipped"),
    bot: el.str_attr("bot"),
  };
}
