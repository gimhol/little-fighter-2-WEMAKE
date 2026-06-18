import type { Difficulty } from "../../defines/Difficulty";
import type { IStagePhaseInfo } from "../../defines/IStagePhaseInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { xml_to_stage_object_info } from "./xml_to_stage_object_info";

function parse_diff_map(el: IXMLElement, attr: string): { [x in Difficulty]?: number } | undefined {
  const v = el.strs_attr(attr, ",");
  if (!v) {
    const num = el.num_attr(attr);
    return num !== void 0 ? { 1: num, 2: num, 3: num, 4: num } : void 0;
  }
  const ret: Record<number, number> = {};
  for (const pair of v) {
    const [d, n] = pair.split(":").map(s => s.trim());
    if (d && n) {
      const dn = Number(d);
      if (!isNaN(dn)) ret[dn] = Number(n);
    }
  }
  return Object.keys(ret).length ? ret : void 0;
}

/**
 * 解析 <phase> → IStagePhaseInfo
 */
export function xml_to_stage_phase_info(el: IXMLElement): IStagePhaseInfo {
  const ret: IStagePhaseInfo = {
    bound: el.num_attr("bound") ?? 0,
  };

  ret.title = el.str_attr("title");
  ret.desc = el.str_attr("desc");
  ret.music = el.str_attr("music");

  ret.player_l = el.num_attr("player_l");
  ret.player_r = el.num_attr("player_r");
  ret.camera_l = el.num_attr("camera_l");
  ret.camera_r = el.num_attr("camera_r");
  ret.enemy_l = el.num_attr("enemy_l");
  ret.enemy_r = el.num_attr("enemy_r");
  ret.drink_l = el.num_attr("drink_l");
  ret.drink_r = el.num_attr("drink_r");
  ret.cam_jump_to_x = el.num_attr("cam_jump_to_x");
  ret.player_jump_to_x = el.num_attr("player_jump_to_x");
  ret.player_jump_to_z = el.num_attr("player_jump_to_z");

  // objects
  const objs = el.children_by_tag("object");
  if (objs.length) {
    ret.objects = objs.map(o => xml_to_stage_object_info(o));
  }

  // difficulty maps
  ret.respawn = parse_diff_map(el, "respawn");
  ret.respawn_r = parse_diff_map(el, "respawn_r");
  ret.respawn_x = parse_diff_map(el, "respawn_x");
  ret.health_up = parse_diff_map(el, "health_up");
  ret.mp_up = parse_diff_map(el, "mp_up");

  return ret;
}
