import type { IStageObjectInfo } from "../../defines/IStageObjectInfo";
import type { IXMLElement, IXML } from "../../ditto/xml";

/**
 * 序列化 <object>（关卡物件）
 */
export function xml_from_stage_object_info(xml: IXML, o: IStageObjectInfo): IXMLElement {
  const el = xml.create("object");

  el.set_strs_attr("id", o.id);
  el.set_num_attr("x", o.x);
  el.set_num_attr("y", o.y);
  el.set_num_attr("z", o.z);
  el.set_str_attr("act", o.act);
  el.set_num_attr("facing", o.facing as number);
  el.set_num_attr("hp", o.hp);
  el.set_num_attr("mp", o.mp);
  el.set_num_attr("times", o.times);
  el.set_num_attr("ratio", o.ratio);
  el.set_bool_attr("is_boss", o.is_boss);
  el.set_bool_attr("is_soldier", o.is_soldier);
  el.set_num_attr("reserve", o.reserve);
  el.set_num_attr("join", o.join);
  el.set_str_attr("join_team", o.join_team);
  el.set_str_attr("outline_color", o.outline_color);

  return el;
}
