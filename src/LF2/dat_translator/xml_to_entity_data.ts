import { entity_info_new, type IEntityInfo } from "../defines/IEntityInfo";
import { EntityEnum, type TEntityEnum } from "../defines/EntityEnum";
import type { IFrameInfo } from "../defines/IFrameInfo";
import { IEntityData } from "../defines/IEntityData";
import type { TNextFrame } from "../defines/INextFrame";
import type { IXMLElement } from "../ditto/xml/IXMLElement";
import { xml_to_frame_info } from "./xml_to_frame_info";
import { xml_to_bdy_info } from "./xml_to_bdy_info";
import { xml_to_itr_info } from "./xml_to_itr_info";
import { xml_to_drink_info } from "./xml_to_drink_info";
import { xml_to_armor_info } from "./xml_to_armor_info";

/**
 * 解析 `<base>`（IEntityInfo）
 * @param {IXMLElement} el - 包含 base 属性的元素
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
  // bounce / bounce_min / fast 支持 nums_attr_soft 快捷属性 (x,y,z 顺序)
  const apply3 = (prefix: string, keyX: keyof IEntityInfo, keyY: keyof IEntityInfo, keyZ: keyof IEntityInfo) => {
    const nums = el.nums_attr_soft(prefix);
    if (nums) {
      if (nums[0] !== void 0) (ret as any)[keyY] = nums[0];
      if (nums[1] !== void 0) (ret as any)[keyX] = nums[1];
      if (nums[2] !== void 0) (ret as any)[keyZ] = nums[2];
    }
  };
  apply3("bounce", "bounce_x", "bounce_y", "bounce_z");
  apply3("bounce_min", "bounce_min_x", "bounce_min_y", "bounce_min_z");
  apply3("fast", "fast_vx", "fast_vy", "fast_vz");
  ret.bounce_y = el.num_attr("bounce_y") ?? ret.bounce_y;
  ret.bounce_x = el.num_attr("bounce_x") ?? ret.bounce_x;
  ret.bounce_z = el.num_attr("bounce_z") ?? ret.bounce_z;
  ret.bounce_min_y = el.num_attr("bounce_min_y") ?? ret.bounce_min_y;
  ret.bounce_min_x = el.num_attr("bounce_min_x") ?? ret.bounce_min_x;
  ret.bounce_min_z = el.num_attr("bounce_min_z") ?? ret.bounce_min_z;
  ret.fast_vy = el.num_attr("fast_vy") ?? ret.fast_vy;
  ret.fast_vx = el.num_attr("fast_vx") ?? ret.fast_vx;
  ret.fast_vz = el.num_attr("fast_vz") ?? ret.fast_vz;
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
      const name = f.str_attr("name") ?? f.str_attr("id") ?? "";
      files[name] = {
        id: f.str_attr("id") ?? name,
        path: f.str_attr("path") ?? f.str_attr("src") ?? "",
        row: f.num_attr("row"),
        col: f.num_attr("col"),
        cell_w: f.num_attr("cell_w"),
        cell_h: f.num_attr("cell_h"),
        variants: f.strs_attr("variants"),
      };
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

  // drink / armor
  const drinkEl = el.first_by_tag("drink");
  if (drinkEl) ret.drink = xml_to_drink_info(drinkEl);
  const armorEl = el.first_by_tag("armor");
  if (armorEl) ret.armor = xml_to_armor_info(armorEl);

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
  for (const child of el.children_by_tag("bdy")) {
    const prefab = xml_to_bdy_info(child) as any;
    prefab.id = child.str_attr("id") ?? "";
    bdy_prefabs[prefab.id] = prefab;
  }

  const itr_prefabs: Record<string, any> = {};
  for (const child of el.children_by_tag("itr")) {
    const prefab = xml_to_itr_info(child) as any;
    prefab.id = child.str_attr("id") ?? "";
    itr_prefabs[prefab.id] = prefab;
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
