import type { IChapterInfo, IStageInfo } from "../../defines/IStageInfo";
import type { IXML } from "../../ditto/xml";
import { xml_x_chapter_info, xml_x_stage_info } from "./xml_x_stage_info";

/**
 * 序列化关卡信息列表为 XML（<stages> 包裹多个 <stage>）
 */
export function xml_from_stage_info_list(xml: IXML, stages: IStageInfo[]): string {
  const root = xml.create("stages");
  for (const s of stages) {
    root.insert(xml_x_stage_info(xml, s, 'stage'));
  }
  return root.stringify();
}

/**
 * 序列化章节信息列表为 XML（<chapters> 包裹多个 <chapter>）
 */
export function xml_from_chapter_info_list(xml: IXML, chapters: IChapterInfo[]): string {
  const root = xml.create("chapters");
  for (const c of chapters) {
    root.insert(xml_x_chapter_info(xml, c, 'chapter'));
  }
  return root.stringify();
}

