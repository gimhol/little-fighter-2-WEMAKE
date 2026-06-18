import type { IStageInfo } from "../../defines/IStageInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { IXMLFactory } from "./xml_from_bg_data";

/**
 * 将 data 的属性写入 elem 的 XML 属性中
 */
function writeAttrs(elem: IXMLElement, data: Record<string, unknown>, keys?: string[]): void {
  const ks = keys ?? Object.keys(data);
  for (const k of ks) {
    const v = (data as any)[k];
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) {
      elem.set_strs_attr(k, v.map(String));
    } else {
      elem.set_str_attr(k, String(v));
    }
  }
}

/**
 * 构建 <phase>
 */
function build_phase(xml: IXMLFactory, p: IStageInfo["phases"][number]): IXMLElement {
  const el = xml.create("phase");

  const numKeys: (keyof typeof p)[] = [
    "bound", "player_l", "player_r", "camera_l", "camera_r",
    "enemy_l", "enemy_r", "drink_l", "drink_r",
    "cam_jump_to_x", "player_jump_to_x", "player_jump_to_z",
  ];
  for (const k of numKeys) {
    const v = (p as any)[k];
    if (v !== undefined && v !== null && v !== 0) el.set_num_attr(k as string, v);
  }

  const strKeys: (keyof typeof p)[] = ["title", "desc", "music"];
  for (const k of strKeys) {
    const v = (p as any)[k];
    if (v !== undefined && v !== null && v !== "") el.set_str_attr(k as string, v);
  }

  // 难度映射：respawn / respawn_r / respawn_x / health_up / mp_up
  const diffKeys = ["respawn", "respawn_r", "respawn_x", "health_up", "mp_up"] as const;
  for (const dk of diffKeys) {
    const dmap = (p as any)[dk];
    if (dmap && typeof dmap === "object" && Object.keys(dmap).length) {
      const vals = Object.values(dmap as Record<string, number>);
      if (new Set(vals).size === 1) {
        el.set_num_attr(dk, vals[0]);
      } else {
        el.set_str_attr(dk, Object.entries(dmap as Record<string, number>)
          .map(([d, n]) => `${d}:${n}`).join(","));
      }
    }
  }

  // objects
  if (p.objects && p.objects.length) {
    for (const o of p.objects) {
      const oEl = xml.create("object");
      oEl.set_strs_attr("id", o.id);
      oEl.set_num_attr("x", o.x);
      if (o.y !== undefined && o.y !== 0) oEl.set_num_attr("y", o.y);
      if (o.z !== undefined && o.z !== 0) oEl.set_num_attr("z", o.z);
      if (o.act) oEl.set_str_attr("act", o.act);
      if (o.facing) oEl.set_num_attr("facing", o.facing);
      if (o.hp) oEl.set_num_attr("hp", o.hp);
      if (o.mp) oEl.set_num_attr("mp", o.mp);
      el.insert(oEl);
    }
  }

  return el;
}

/**
 * 序列化关卡信息列表为 XML（<stages> 包裹多个 <stage>）
 */
export function xml_from_stage_info(xml: IXMLFactory, stages: IStageInfo[]): string {
  const root = xml.create("stages");
  for (const s of stages) {
    const el = xml.create("stage");
    el.set_attr("id", s.id);
    if (s.name) el.set_str_attr("name", s.name);
    if (s.bg) el.set_str_attr("bg", s.bg);
    if (s.chapter) el.set_str_attr("chapter", s.chapter);
    if (s.next) el.set_str_attr("next", s.next);
    if (s.cond_end) el.set_str_attr("cond_end", s.cond_end);
    if (s.act_of_goto_next) el.set_str_attr("act_of_goto_next", s.act_of_goto_next);
    if (s.is_starting) el.set_bool_attr("is_starting", s.is_starting);
    if (s.starting_name) el.set_str_attr("starting_name", s.starting_name);
    if (s.title) el.set_str_attr("title", s.title);
    if (s.group?.length) el.set_strs_attr("group", s.group);

    for (const phase of s.phases) {
      el.insert(build_phase(xml, phase));
    }

    root.insert(el);
  }
  return root.stringify();
}
