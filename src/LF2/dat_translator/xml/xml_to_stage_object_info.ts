import type { IStageObjectInfo } from "../../defines/IStageObjectInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { parse_diff_map } from "./diff_map_utils";

/**
 * 解析 <object> → IStageObjectInfo
 */
export function xml_to_stage_object_info(el: IXMLElement): IStageObjectInfo {
  return {
    id: el.strs_attr("id") ?? [],
    id_method: el.str_attr("id_method"),
    x: el.num_attr("x") ?? 0,
    y: el.num_attr("y"),
    z: el.num_attr("z"),
    act: el.str_attr("act"),
    facing: el.num_attr("facing") as (1 | -1) | undefined,
    hp: el.num_attr("hp"),
    mp: el.num_attr("mp"),
    hp_map: parse_diff_map(el, "hp"),
    mp_map: parse_diff_map(el, "mp"),
    times: el.num_attr("times"),
    ratio: el.num_attr("ratio"),
    is_boss: el.bool_attr("is_boss") as true | undefined,
    is_soldier: el.bool_attr("is_soldier") as true | undefined,
    reserve: el.num_attr("reserve"),
    join: el.num_attr("join"),
    join_team: el.str_attr("join_team"),
    outline_color: el.str_attr("outline_color"),
  };
}
