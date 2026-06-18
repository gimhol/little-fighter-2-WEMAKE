import type { IEntityData } from "../../defines/IEntityData";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";
import { xml_from_frame_info } from "./xml_from_frame_info";
import { xml_from_entity_info } from "./xml_from_entity_info";
import { xml_from_next_frame } from "./xml_from_next_frame";
import { xml_from_bdy_info } from "./xml_from_bdy_info";
import { xml_from_itr_info } from "./xml_from_itr_info";
export { xml_from_entity_info };

/**
 * 序列化实体数据为 XML 元素树，再 stringify 输出
 */
export function xml_from_entity_data(xml: IXMLFactory, data: IEntityData): string {
  const root = xml.create("entity");
  root.set_attr("id", data.id);

  // base
  root.insert(xml_from_entity_info(xml, data.base));

  // on_dead / on_exhaustion (可能为数组)
  if (data.on_dead) {
    const list = Array.isArray(data.on_dead) ? data.on_dead : [data.on_dead];
    for (const nf of list) root.insert(xml_from_next_frame(xml, nf, "on_dead"));
  }
  if (data.on_exhaustion) {
    const list = Array.isArray(data.on_exhaustion) ? data.on_exhaustion : [data.on_exhaustion];
    for (const nf of list) root.insert(xml_from_next_frame(xml, nf, "on_exhaustion"));
  }

  // bdy_prefabs
  if (data.bdy_prefabs && Object.keys(data.bdy_prefabs).length) {
    for (const [k, v] of Object.entries(data.bdy_prefabs)) {
      if (!v) continue;
      root.insert(xml_from_bdy_info(xml, v, "bdy_prefab"));
    }
  }

  // itr_prefabs
  if (data.itr_prefabs && Object.keys(data.itr_prefabs).length) {
    for (const [k, v] of Object.entries(data.itr_prefabs)) {
      if (!v) continue;
      root.insert(xml_from_itr_info(xml, v, "itr_prefab"));
    }
  }

  // frames
  for (const [fid, frame] of Object.entries(data.frames)) {
    const fEl = xml_from_frame_info(xml, fid, frame);
    if (fEl) root.insert(fEl);
  }

  // indexes
  if (data.indexes && Object.keys(data.indexes).length) {
    const idxEl = xml.create("indexes");
    for (const [key, value] of Object.entries(data.indexes)) {
      const child = xml.create(key);
      if (Array.isArray(value)) {
        child.set_strs_attr("ids", value);
      } else {
        child.set_str_attr("id", String(value));
      }
      idxEl.insert(child);
    }
    root.insert(idxEl);
  }

  return root.stringify();
}
