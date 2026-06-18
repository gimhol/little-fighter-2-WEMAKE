import { entity_info_new, type IEntityInfo } from "../defines/IEntityInfo";
import { EntityEnum, type TEntityEnum } from "../defines/EntityEnum";
import type { IFrameInfo } from "../defines/IFrameInfo";
import { IEntityData } from "../defines/IEntityData";
import type { TNextFrame } from "../defines/INextFrame";
import type { IXMLElement } from "../ditto/xml/IXMLElement";
import { xml_to_frame_info } from "./xml_to_frame_info";

/**
 * 解析 `<info>`（IEntityInfo）
 * @param {IXMLElement} el - 包含 info 属性的元素
 * @return {IEntityInfo}
 */
export function xml_to_entity_info(el: IXMLElement): IEntityInfo {
  const ret = entity_info_new();

  // text / str attributes
  ret.name = el.str_attr("name") ?? "";
  ret.head = el.str_attr("head");
  ret.small = el.str_attr("small");

  // type
  const type = el.num_attr("type") ?? el.str_attr("type") as any;
  if (type !== void 0) ret.type = type;

  // numeric attributes
  ret.ce = el.num_attr("ce");
  ret.weight = el.num_attr("weight");
  ret.strength = el.num_attr("strength");
  ret.bounce_y = el.num_attr("bounce_y");
  ret.bounce_x = el.num_attr("bounce_x");
  ret.bounce_z = el.num_attr("bounce_z");
  ret.bounce_min_y = el.num_attr("bounce_min_y");
  ret.bounce_min_x = el.num_attr("bounce_min_x");
  ret.bounce_min_z = el.num_attr("bounce_min_z");
  ret.fast_vy = el.num_attr("fast_vy");
  ret.fast_vx = el.num_attr("fast_vx");
  ret.fast_vz = el.num_attr("fast_vz");
  ret.drop_hurt = el.num_attr("drop_hurt");
  ret.resting_max = el.num_attr("resting_max");

  // string arrays
  ret.group = el.strs_attr("group");
  ret.hit_sounds = el.strs_attr("hit_sounds");
  ret.drop_sounds = el.strs_attr("drop_sounds");
  ret.dead_sounds = el.strs_attr("dead_sounds");

  // bot_id (text attr or child element)
  ret.bot_id = el.str_attr("bot_id") ?? el.first_by_tag("bot")?.str_attr("id");

  // files
  const filesEl = el.first_by_tag("files");
  if (filesEl) {
    const files: Record<string, any> = {};
    for (const f of filesEl.children_by_tag("file")) {
      const name = f.str_attr("name") ?? "";
      files[name] = { tex: f.str_attr("tex") ?? name, x: f.num_attr("x") ?? 0, y: f.num_attr("y") ?? 0, w: f.num_attr("w") ?? 0, h: f.num_attr("h") ?? 0 };
    }
    if (Object.keys(files).length) ret.files = files as any;
  }

  // portraits
  const portraitsEl = el.first_by_tag("portraits");
  if (portraitsEl) {
    const portraits: Record<string, any> = {};
    for (const p of portraitsEl.children_by_tag("portrait")) {
      const name = p.str_attr("name") ?? "";
      portraits[name] = { tex: p.str_attr("tex") ?? "0", x: p.num_attr("x") ?? 0, y: p.num_attr("y") ?? 0, w: p.num_attr("w") ?? 0, h: p.num_attr("h") ?? 0 };
    }
    if (Object.keys(portraits).length) ret.portraits = portraits as any;
  }

  // drink
  const drinkEl = el.first_by_tag("drink");
  if (drinkEl) {
    ret.drink = {
      hp_h_total: drinkEl.num_attr("hp_h_total"),
      hp_h_value: drinkEl.num_attr("hp_h_value"),
      hp_h_ticks: drinkEl.num_attr("hp_h_ticks"),
      hp_r_total: drinkEl.num_attr("hp_r_total"),
      hp_r_value: drinkEl.num_attr("hp_r_value"),
      hp_r_ticks: drinkEl.num_attr("hp_r_ticks"),
      mp_h_total: drinkEl.num_attr("mp_h_total"),
      mp_h_value: drinkEl.num_attr("mp_h_value"),
      mp_h_ticks: drinkEl.num_attr("mp_h_ticks"),
    };
  }

  // armor
  const armorEl = el.first_by_tag("armor");
  if (armorEl) {
    ret.armor = {
      type: armorEl.str_attr("type") ?? armorEl.num_attr("type") ?? 0,
      toughness: armorEl.num_attr("toughness") ?? 1,
      hit_sounds: armorEl.strs_attr("hit_sounds"),
      dead_sounds: armorEl.strs_attr("dead_sounds"),
      fireproof: armorEl.num_attr("fireproof"),
      antifreeze: armorEl.num_attr("antifreeze"),
      fulltime: armorEl.bool_attr("fulltime"),
      injury_ratio: armorEl.num_attr("injury_ratio"),
      shaking_ratio: armorEl.num_attr("shaking_ratio"),
      motionless_ratio: armorEl.num_attr("motionless_ratio"),
    };
  }

  // dataset overrides
  for (const child of el.children_by_tag("dataset")) {
    const v = child.values();
    for (const k of Object.keys(v)) (ret as any)[k] = v[k];
  }

  return ret;
}

/**
 * 解析 `<entity>` 为 IEntityData
 * @param {IXMLElement} el - 根元素
 * @return {IEntityData}
 */
export function xml_to_entity_data(el: IXMLElement): IEntityData {
  const id = el.attr("id") ?? "";
  const name = el.str_attr("name");

  // info (优先 <info> 子元素，否则从自身属性）
  const infoEl = el.first_by_tag("info");
  const info = infoEl ? xml_to_entity_info(infoEl) : xml_to_entity_info(el);
  if (name) info.name = name;

  // frames
  const frames: Record<string, IFrameInfo> = {};
  for (const child of el.children_by_tag("frame")) {
    const fi = xml_to_frame_info(child);
    frames[fi.id] = fi;
  }

  // prefabs
  const bdy_prefabs: Record<string, any> = {};
  for (const child of el.children_by_tag("bdy_prefab")) {
    const pid = child.str_attr("id") ?? "";
    bdy_prefabs[pid] = {
      id: pid,
      x: child.num_attr("x"),
      y: child.num_attr("y"),
      w: child.num_attr("w"),
      h: child.num_attr("h"),
      z: child.num_attr("z"),
      l: child.num_attr("l"),
      kind: child.num_attr("kind"),
      hit_flag: child.num_attr("hit_flag"),
    };
  }

  const itr_prefabs: Record<string, any> = {};
  for (const child of el.children_by_tag("itr_prefab")) {
    const pid = child.str_attr("id") ?? "";
    itr_prefabs[pid] = {
      id: pid,
      x: child.num_attr("x"),
      y: child.num_attr("y"),
      w: child.num_attr("w"),
      h: child.num_attr("h"),
      z: child.num_attr("z"),
      l: child.num_attr("l"),
      kind: child.num_attr("kind"),
      injury: child.num_attr("injury"),
      dvx: child.num_attr("dvx"),
      dvy: child.num_attr("dvy"),
      dvz: child.num_attr("dvz"),
    };
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
  for (const child of el.children_by_tag("on_dead")) {
    ret.on_dead = { id: child.str_attr("id") ?? "" };
  }
  for (const child of el.children_by_tag("on_exhaustion")) {
    ret.on_exhaustion = { id: child.str_attr("id") ?? "" };
  }

  return ret;
}
