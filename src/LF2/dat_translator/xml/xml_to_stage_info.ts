import type { IStageInfo } from "../../defines/IStageInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { xml_to_stage_phase_info } from "./xml_to_stage_phase_info";
export { xml_to_stage_phase_info };

export function xml_to_stage_info(el: IXMLElement): IStageInfo {
  return {
    id: el.attr("id") ?? "",
    name: el.str_attr("name") ?? "",
    bg: el.str_attr("bg") ?? "",
    phases: el.children_by_tag("phase").map(xml_to_stage_phase_info),
    chapter: el.str_attr("chapter"),
    next: el.str_attr("next"),
    cond_end: el.str_attr("cond_end"),
    act_of_goto_next: el.str_attr("act_of_goto_next"),
    is_starting: el.bool_attr("is_starting"),
    starting_name: el.str_attr("starting_name"),
    title: el.str_attr("title"),
    group: el.strs_attr("group"),
  };
}

/**
 * 解析 <stages> → 返回 IStageInfo 列表
 *
 * 如果 XML 根是 <stages>，迭代 <stage> 子元素；
 * 如果根就是 <stage>，回退到单元素解析
 */
export function xml_to_stage_info_list(el: IXMLElement): IStageInfo[] {
  if (el.tagName === "stages") {
    return el.children_by_tag("stage").map(xml_to_stage_info);
  }
  // fallback: 直接就是 <stage> 元素
  if (el.tagName === "stage") {
    return [xml_to_stage_info(el)];
  }
  return [];
}
