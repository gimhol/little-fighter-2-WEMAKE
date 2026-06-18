import type { IEntityData } from "../../defines/IEntityData";
import type { IEntityInfo } from "../../defines/IEntityInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";
import { writeXmlAttrs } from "./xml_from_write";
import { xml_from_frame_info } from "./xml_from_frame_info";
import { xml_from_drink_info } from "./xml_from_drink_info";
import { xml_from_armor_info } from "./xml_from_armor_info";

const BASE_NUM_KEYS: (keyof IEntityInfo)[] = [
  "type", "ce", "weight", "strength",
  "bounce_y", "bounce_x", "bounce_z",
  "bounce_min_y", "bounce_min_x", "bounce_min_z",
  "fast_vy", "fast_vx", "fast_vz",
  "drop_hurt", "resting_max",
];
const BASE_STR_KEYS: (keyof IEntityInfo)[] = [
  "name", "head", "small", "bot_id",
];
const BASE_ARR_KEYS: (keyof IEntityInfo)[] = [
  "group", "hit_sounds", "drop_sounds", "dead_sounds",
];

function build_base(xml: IXMLFactory, base: IEntityInfo): IXMLElement {
  const el = xml.create("base");

  for (const k of BASE_STR_KEYS) {
    const v = (base as any)[k];
    if (v !== undefined && v !== null && v !== "") el.set_str_attr(k, v);
  }
  for (const k of BASE_NUM_KEYS) {
    const v = (base as any)[k];
    if (v !== undefined && v !== null && v !== 0) el.set_num_attr(k, v);
  }
  for (const k of BASE_ARR_KEYS) {
    const v = (base as any)[k];
    if (v !== undefined && v !== null && Array.isArray(v) && v.length) {
      el.set_strs_attr(k, v as string[]);
    }
  }

  // files
  if (base.files && Object.keys(base.files).length) {
    const filesEl = xml.create("files");
    for (const [name, f] of Object.entries(base.files)) {
      const fileEl = xml.create("file");
      fileEl.set_str_attr("name", name);
      fileEl.set_str_attr("path", f.path);
      if (f.row !== undefined) fileEl.set_num_attr("row", f.row);
      if (f.col !== undefined) fileEl.set_num_attr("col", f.col);
      if (f.cell_w !== undefined) fileEl.set_num_attr("cell_w", f.cell_w);
      if (f.cell_h !== undefined) fileEl.set_num_attr("cell_h", f.cell_h);
      if (f.variants?.length) fileEl.set_strs_attr("variants", f.variants);
      filesEl.insert(fileEl);
    }
    el.insert(filesEl);
  }

  // portraits
  if (base.portraits && Object.keys(base.portraits).length) {
    const ptsEl = xml.create("portraits");
    for (const [name, p] of Object.entries(base.portraits)) {
      const pEl = xml.create("portrait");
      pEl.set_str_attr("name", name);
      writeXmlAttrs(pEl, p as any);
      ptsEl.insert(pEl);
    }
    el.insert(ptsEl);
  }

  // drink
  if (base.drink) {
    el.insert(xml_from_drink_info(xml, base.drink));
  }

  // armor
  if (base.armor) {
    el.insert(xml_from_armor_info(xml, base.armor));
  }

  return el;
}

function build_prefab(xml: IXMLFactory, tag: string, id: string, obj: Record<string, unknown>): IXMLElement {
  const el = xml.create(tag);
  el.set_attr("id", id);
  writeXmlAttrs(el, obj);
  return el;
}

/**
 * 序列化实体数据为 XML 元素树，再 stringify 输出
 */
export function xml_from_entity_data(xml: IXMLFactory, data: IEntityData): string {
  const root = xml.create("entity");
  root.set_attr("id", data.id);

  // base
  root.insert(build_base(xml, data.base));

  // on_dead / on_exhaustion
  if (data.on_dead) {
    const n = xml.create("on_dead");
    writeXmlAttrs(n, data.on_dead as any);
    root.insert(n);
  }
  if (data.on_exhaustion) {
    const n = xml.create("on_exhaustion");
    writeXmlAttrs(n, data.on_exhaustion as any);
    root.insert(n);
  }

  // bdy_prefabs
  if (data.bdy_prefabs && Object.keys(data.bdy_prefabs).length) {
    for (const [k, v] of Object.entries(data.bdy_prefabs)) {
      if (!v) continue;
      root.insert(build_prefab(xml, "bdy_prefab", k, v as any));
    }
  }

  // itr_prefabs
  if (data.itr_prefabs && Object.keys(data.itr_prefabs).length) {
    for (const [k, v] of Object.entries(data.itr_prefabs)) {
      if (!v) continue;
      root.insert(build_prefab(xml, "itr_prefab", k, v as any));
    }
  }

  // frames
  for (const [fid, frame] of Object.entries(data.frames)) {
    const fEl = xml_from_frame_info(xml, fid, frame);
    if (fEl) root.insert(fEl);
  }

  return root.stringify();
}
