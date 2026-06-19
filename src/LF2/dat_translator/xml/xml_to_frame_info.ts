import { frame_info_new, type IFrameInfo } from "../../defines/IFrameInfo";
import type { IHitKeyCollection } from "../../defines/IHitKeyCollection";
import type { IHoldKeyCollection } from "../../defines/IHoldKeyCollection";
import type { IQube } from "../../defines/IQube";
import type { IXMLElement } from "../../ditto/xml";
import { xml_to_bdy_info } from "./xml_to_bdy_info";
import { xml_to_bpoint } from "./xml_to_bpoint";
import { xml_to_chase } from "./xml_to_chase";
import { xml_to_cpoint } from "./xml_to_cpoint";
import { xml_to_itr_info } from "./xml_to_itr_info";
import { xml_to_key_collection } from "./xml_to_key_collection";
import { xml_to_next_frame } from "./xml_to_next_frame";
import { xml_to_opoint } from "./xml_to_opoint";
import { xml_to_pic } from "./xml_to_pic";
import { xml_to_wpoint } from "./xml_to_wpoint";
import { xml_to_world_dataset } from "./xml_to_world_dataset";

/**
 * 解析快捷属性：rect="x,y,w,h" 或 qube="x,y,w,h" 或 qube="x,y,w,h,z,l"
 */
function parse_rect_qube(el: IXMLElement): Partial<IQube> {
  const rect = el.nums_attr("rect");
  if (rect && rect.length >= 4) {
    return { x: rect[0], y: rect[1], w: rect[2], h: rect[3], z: rect[4], l: rect[5] };
  }
  const qube = el.nums_attr("qube");
  if (qube && qube.length >= 4) {
    return { x: qube[0], y: qube[1], w: qube[2], h: qube[3], z: qube[4], l: qube[5] };
  }
  return {};
}

/**
 * 应用 dv/acc/vm/ctrl 快捷属性到目标对象
 */
export function apply_velocity_shorthand(el: IXMLElement, target: Record<string, any>): void {
  const dv = el.nums_attr_soft("dv");
  if (dv) {
    if (dv[0] !== void 0) target.dvx = dv[0];
    if (dv[1] !== void 0) target.dvy = dv[1];
    if (dv[2] !== void 0) target.dvz = dv[2];
  }
  const acc = el.nums_attr_soft("acc");
  if (acc) {
    if (acc[0] !== void 0) target.acc_x = acc[0];
    if (acc[1] !== void 0) target.acc_y = acc[1];
    if (acc[2] !== void 0) target.acc_z = acc[2];
  }
  const vm = el.nums_attr_soft("vm");
  if (vm) {
    if (vm[0] !== void 0) target.vxm = vm[0];
    if (vm[1] !== void 0) target.vym = vm[1];
    if (vm[2] !== void 0) target.vzm = vm[2];
  }
  const ctrl = el.nums_attr_soft("ctrl");
  if (ctrl) {
    if (ctrl[0] !== void 0) target.ctrl_x = ctrl[0];
    if (ctrl[1] !== void 0) target.ctrl_y = ctrl[1];
    if (ctrl[2] !== void 0) target.ctrl_z = ctrl[2];
  }
}

/**
 * 解析 qube 基类属性（x, y, w, h, z, l），支持 rect/qube 快捷属性
 */
export function xml_to_qube(el: IXMLElement): Partial<IQube> {
  const shortcut = parse_rect_qube(el);
  return {
    x: el.num_attr("x") ?? shortcut.x ?? 0,
    y: el.num_attr("y") ?? shortcut.y ?? 0,
    w: el.num_attr("w") ?? shortcut.w ?? 0,
    h: el.num_attr("h") ?? shortcut.h ?? 0,
    z: el.num_attr("z") ?? shortcut.z,
    l: el.num_attr("l") ?? shortcut.l,
  };
}

/**
 * 获取合并后首个结果（多个同名 tag 时 Object.assign 合并，后者覆盖前者）
 * @param el      父元素
 * @param tag     标签名
 * @param parser  解析函数
 * @return 合并后的解析结果，无匹配时 undefined
 */
export function merge_by_tag<T extends Record<string, any>>(
  el: IXMLElement,
  tag: string,
  parser: (child: IXMLElement) => T,
): T | undefined {
  const children = el.children_by_tag(tag);
  if (!children.length) return void 0;
  let ret: T = parser(children[0]);
  for (let i = 1; i < children.length; i++) {
    ret = Object.assign(ret, parser(children[i]));
  }
  return ret;
}

/**
 * 按标签名合并解析数组（用于 bdy/itr/opoint 等）
 */
function merge_array_by_tag<T>(
  el: IXMLElement,
  tag: string,
  parser: (child: IXMLElement) => T,
): T[] {
  return el.children_by_tag(tag).map(parser);
}

export function xml_to_frame_info(el: IXMLElement): IFrameInfo {
  const ret = frame_info_new();

  // 基础属性
  const id = el.str_attr("id");
  if (id) ret.id = id;
  const name = el.str_attr("name");
  if (name) ret.name = name;
  ret.state = el.num_attr("state") ?? 0;
  ret.wait = el.num_attr("wait") ?? 0;
  // center="x,y" 快捷属性
  const center = el.nums_attr("center");
  ret.centerx = el.num_attr("centerx") ?? center?.[0] ?? 0;
  ret.centery = el.num_attr("centery") ?? center?.[1] ?? 0;
  ret.width = el.num_attr("width") ?? 0;
  ret.height = el.num_attr("height") ?? 0;

  // 可选属性
  const sound = el.str_attr("sound");
  if (sound !== void 0) ret.sound = sound;
  ret.hp_max = el.num_attr("hp_max");
  const invisible = el.num_attr("invisible");
  if (invisible !== void 0) ret.invisible = invisible;
  const noShadow = el.num_attr("no_shadow");
  if (noShadow !== void 0) ret.no_shadow = noShadow;
  const jumpFlag = el.num_attr("jump_flag");
  if (jumpFlag !== void 0) ret.jump_flag = jumpFlag;
  const behavior = el.num_attr("behavior");
  if (behavior !== void 0) ret.behavior = behavior;
  const landable = el.num_attr("landable");
  if (landable !== void 0) ret.landable = landable;
  const facing = el.num_attr("facing");
  if (facing !== void 0) ret.facing = facing;
  const gravity = el.num_attr("gravity_enabled") ?? el.num_attr("gravity");
  if (gravity !== void 0) ret.gravity_enabled = !!gravity;
  apply_velocity_shorthand(el, ret as any);

  // nested elements (多个同名 tag 时以后者覆盖前者)
  ret.pic = merge_by_tag(el, "pic", xml_to_pic);

  const mergedNext = merge_array_by_tag(el, "next", xml_to_next_frame);
  ret.next = mergedNext.length === 1 ? mergedNext[0] : mergedNext.length ? mergedNext : { id: "" };
  const onDead = merge_array_by_tag(el, "on_dead", xml_to_next_frame);
  ret.on_dead = onDead.length === 1 ? onDead[0] : onDead.length ? onDead : void 0;
  const onLanding = merge_array_by_tag(el, "on_landing", xml_to_next_frame);
  ret.on_landing = onLanding.length === 1 ? onLanding[0] : onLanding.length ? onLanding : void 0;
  const onExhaustion = merge_array_by_tag(el, "on_exhaustion", xml_to_next_frame);
  ret.on_exhaustion = onExhaustion.length === 1 ? onExhaustion[0] : onExhaustion.length ? onExhaustion : void 0;

  // arrays (仅非空时覆盖)
  const bdys = merge_array_by_tag(el, "bdy", xml_to_bdy_info);
  if (bdys.length) ret.bdy = bdys;
  const itrs = merge_array_by_tag(el, "itr", xml_to_itr_info);
  if (itrs.length) ret.itr = itrs;
  const opoints = merge_array_by_tag(el, "opoint", xml_to_opoint);
  if (opoints.length) ret.opoint = opoints;

  // single nested elements
  ret.wpoint = merge_by_tag(el, "wpoint", xml_to_wpoint);
  ret.bpoint = merge_by_tag(el, "bpoint", xml_to_bpoint);
  ret.cpoint = merge_by_tag(el, "cpoint", xml_to_cpoint);
  ret.chase = merge_by_tag(el, "chase", xml_to_chase);

  // key collections
  ret.hit = merge_by_tag(el, "hit", xml_to_key_collection) as IHitKeyCollection;
  ret.hold = merge_by_tag(el, "hold", xml_to_key_collection) as IHoldKeyCollection;
  ret.key_down = merge_by_tag(el, "key_down", xml_to_key_collection) as IHoldKeyCollection;
  ret.key_up = merge_by_tag(el, "key_up", xml_to_key_collection) as IHoldKeyCollection;
  ret.seqs = merge_by_tag(el, "seqs", xml_to_key_collection);

  // dataset overrides
  const ds = xml_to_world_dataset(el.first_by_tag("dataset"));
  for (const k of Object.keys(ds)) (ret as any)[k] = (ds as any)[k];

  return ret;
}
