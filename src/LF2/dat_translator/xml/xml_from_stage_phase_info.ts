import type { IStagePhaseInfo } from "../../defines/IStagePhaseInfo";
import type { IXMLElement, IXML } from "../../ditto/xml";
import { xml_from_stage_object_info } from "./xml_from_stage_object_info";

/**
 * 难度映射序列化：若所有值相同则写数字，否则写 "difficulty:value,..."
 */
function write_diff_map(el: IXMLElement, attr: string, map: Record<number, number> | undefined): void {
  if (!map || !Object.keys(map).length) return;
  const vals = Object.values(map);
  if (new Set(vals).size === 1) {
    el.set_num_attr(attr, vals[0]);
  } else {
    el.set_str_attr(attr, Object.entries(map).map(([d, n]) => `${d}:${n}`).join(","));
  }
}

/**
 * 序列化 <phase>
 */
export function xml_from_stage_phase_info(xml: IXML, p: IStagePhaseInfo): IXMLElement {
  const el = xml.create("phase");

  el.set_str_attr("title", p.title);
  el.set_str_attr("desc", p.desc);
  el.set_str_attr("music", p.music);

  el.set_num_attr("bound", p.bound);
  el.set_num_attr("player_l", p.player_l);
  el.set_num_attr("player_r", p.player_r);
  el.set_num_attr("camera_l", p.camera_l);
  el.set_num_attr("camera_r", p.camera_r);
  el.set_num_attr("enemy_l", p.enemy_l);
  el.set_num_attr("enemy_r", p.enemy_r);
  el.set_num_attr("drink_l", p.drink_l);
  el.set_num_attr("drink_r", p.drink_r);
  el.set_num_attr("cam_jump_to_x", p.cam_jump_to_x);
  el.set_num_attr("player_jump_to_x", p.player_jump_to_x);
  el.set_num_attr("player_jump_to_z", p.player_jump_to_z);

  write_diff_map(el, "respawn", p.respawn as Record<number, number>);
  write_diff_map(el, "respawn_r", p.respawn_r as Record<number, number>);
  write_diff_map(el, "respawn_x", p.respawn_x as Record<number, number>);
  write_diff_map(el, "health_up", p.health_up as Record<number, number>);
  write_diff_map(el, "mp_up", p.mp_up as Record<number, number>);

  if (p.objects?.length) {
    for (const o of p.objects) {
      el.insert(xml_from_stage_object_info(xml, o));
    }
  }

  return el;
}
