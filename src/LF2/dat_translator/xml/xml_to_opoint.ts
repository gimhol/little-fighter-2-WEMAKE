import { type IOpointInfo, type IOpointMulti, opoint_info_new } from "../../defines/IOpointInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { apply_velocity_shorthand } from "./xml_to_frame_info";
import { xml_to_next_frame } from "./xml_to_next_frame";
import { xml_to_opoint_multi } from "./xml_to_opoint_multi";

/**
 * 解析 `<opoint>` 生成点
 */
export function xml_to_opoint(el: IXMLElement): IOpointInfo {
  const o = opoint_info_new();
  o.id = el.str_attr("id");
  o.name = el.str_attr("name");
  o.kind = el.num_attr("kind") ?? o.kind;
  const x = el.num_attr("x");
  if (x !== void 0) o.x = x;
  const y = el.num_attr("y");
  if (y !== void 0) o.y = y;
  const z = el.num_attr("z");
  if (z !== void 0) o.z = z;
  o.origin_type = el.num_attr("origin_type");
  const oid = el.strs_attr("oid") ?? (el.str_attr("oid") ? [el.str_attr("oid")!] : void 0);
  if (oid !== void 0) o.oid = oid;
  const actions = el.children_by_tag("action");
  if (actions.length == 1) {
    o.action = xml_to_next_frame(actions[0]);
  } else if (actions.length > 1) {
    o.action = actions.map(v => xml_to_next_frame(v));
  }
  const multi = el.num_attr("multi");
  if (multi !== void 0) o.multi = multi;
  const multiEl = el.first_by_tag("multi");
  if (multiEl) o.multi = xml_to_opoint_multi(multiEl);

  const max_hp = el.num_attr("max_hp");
  if (max_hp !== void 0) o.max_hp = max_hp;
  const hp = el.num_attr("hp");
  if (hp !== void 0) o.hp = hp;
  const max_mp = el.num_attr("max_mp");
  if (max_mp !== void 0) o.max_mp = max_mp;
  const mp = el.num_attr("mp");
  if (mp !== void 0) o.mp = mp;
  const speedz = el.num_attr("speedz");
  if (speedz !== void 0) o.speedz = speedz;
  const spreading = el.num_attr("spreading");
  if (spreading !== void 0) o.spreading = spreading;
  o.is_entity = el.bool_attr("is_entity");
  const interval = el.num_attr("interval");
  if (interval !== void 0) o.interval = interval;
  o.interval_id = el.str_attr("interval_id");
  o.interval_mode = el.num_attr("interval_mode") as (1 | 0) | undefined;
  const motionless = el.num_attr("motionless");
  if (motionless !== void 0) o.motionless = motionless;
  o.spreading_x = el.nums_attr("spreading_x");
  o.spreading_y = el.nums_attr("spreading_y");
  o.spreading_z = el.nums_attr("spreading_z");
  const unimportant = el.num_attr("unimportant");
  if (unimportant !== void 0) o.unimportant = unimportant;
  const delay = el.num_attr("delay");
  if (delay !== void 0) o.delay = delay;
  const inherit_speed_x = el.num_attr("inherit_speed_x");
  if (inherit_speed_x !== void 0) o.inherit_speed_x = inherit_speed_x;
  const inherit_speed_y = el.num_attr("inherit_speed_y");
  if (inherit_speed_y !== void 0) o.inherit_speed_y = inherit_speed_y;
  const inherit_speed_z = el.num_attr("inherit_speed_z");
  if (inherit_speed_z !== void 0) o.inherit_speed_z = inherit_speed_z;

  const dvx = el.num_attr("dvx");
  if (dvx !== void 0) o.dvx = dvx;
  const dvy = el.num_attr("dvy");
  if (dvx !== void 0) o.dvy = dvy;
  const dvz = el.num_attr("dvz");
  if (dvx !== void 0) o.dvz = dvz;
  apply_velocity_shorthand(el, o);
  return o;
}
