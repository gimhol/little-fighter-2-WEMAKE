import { EntityEnum, type TEntityEnum } from "../../defines/EntityEnum";
import { IEntityData } from "../../defines/IEntityData";
import type { IFrameInfo } from "../../defines/IFrameInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { xml_to_itr_info } from "./xml_to_itr_info";
import { xml_to_bdy_info } from "./xml_to_bdy_info";
import { xml_to_frame_info } from "./xml_to_frame_info";
import { xml_to_next_frame } from "./xml_to_next_frame";
import { xml_to_entity_info } from "./xml_to_entity_info";
export { xml_to_entity_info };

/**
 * 解析 `<entity>` 为 IEntityData
 * @param {IXMLElement} el - 根元素
 * @return {IEntityData}
 */
export function xml_to_entity_data(el: IXMLElement): IEntityData {
  const id = el.attr("id") ?? "";
  const name = el.str_attr("name");

  // base (优先 <base> 子元素，否则从自身属性）
  const baseEl = el.first_by_tag("base");
  const info = baseEl ? xml_to_entity_info(baseEl) : xml_to_entity_info(el);
  if (name) info.name = name;

  // frames
  const frames: Record<string, IFrameInfo> = {};
  for (const child of el.children_by_tag("frame")) {
    const fi = xml_to_frame_info(child);
    frames[fi.id] = fi;
  }

  // prefabs (实体级别的 bdy/itr 自动转为 prefab)
  const bdy_prefabs: Record<string, any> = {};
  for (const tag of ["bdy_prefab", "bdy"]) {
    for (const child of el.children_by_tag(tag)) {
      const prefab = xml_to_bdy_info(child);
      prefab.id = child.str_attr("id") ?? prefab.id ?? "";
      bdy_prefabs[prefab.id] = prefab;
    }
  }

  const itr_prefabs: Record<string, any> = {};
  for (const tag of ["itr_prefab", "itr"]) {
    for (const child of el.children_by_tag(tag)) {
      const prefab = xml_to_itr_info(child);
      prefab.id = child.str_attr("id") ?? prefab.id ?? "";
      itr_prefabs[prefab.id] = prefab;
    }
  }

  // indexes
  const idxEl = el.first_by_tag("indexes");
  const indexes: Record<string, any> = {};
  if (idxEl) {
    for (const child of idxEl.children) {
      const tag = child.tagName;
      const v = child.strs_attr("ids") ?? child.strs_attr("list");
      if (v) {
        indexes[tag] = v;
      } else {
        const single = child.str_attr("id");
        if (single) indexes[tag] = single;
      }
    }
  }

  const ret: IEntityData = {
    type: info.type as TEntityEnum ?? EntityEnum.Entity,
    id,
    base: info,
    frames,
  };

  if (Object.keys(bdy_prefabs).length) ret.bdy_prefabs = bdy_prefabs;
  if (Object.keys(itr_prefabs).length) ret.itr_prefabs = itr_prefabs;
  if (Object.keys(indexes).length) ret.indexes = indexes as any;

  // on_dead / on_exhaustion
  const onDeadEls = el.children_by_tag("on_dead");
  if (onDeadEls.length > 1) {
    (ret as any).on_dead = onDeadEls.map(v => xml_to_next_frame(v));
  } else if (onDeadEls.length === 1) {
    ret.on_dead = xml_to_next_frame(onDeadEls[0]);
  }
  const onExhaustionEls = el.children_by_tag("on_exhaustion");
  if (onExhaustionEls.length > 1) {
    (ret as any).on_exhaustion = onExhaustionEls.map(v => xml_to_next_frame(v));
  } else if (onExhaustionEls.length === 1) {
    ret.on_exhaustion = xml_to_next_frame(onExhaustionEls[0]);
  }

  return ret;
}
