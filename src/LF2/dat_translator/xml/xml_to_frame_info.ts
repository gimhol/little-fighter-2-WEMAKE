import { bpoint_info_new, type IBpointInfo } from "../../defines/IBpointInfo";
import { chase_info_new, type IChaseInfo } from "../../defines/IChaseInfo";
import { cpoint_info_new, type ICpointInfo } from "../../defines/ICpointInfo";
import { frame_info_new, type IFrameInfo } from "../../defines/IFrameInfo";
import type { IFramePictureInfo } from "../../defines/IFramePictureInfo";
import type { IHitKeyCollection } from "../../defines/IHitKeyCollection";
import type { IHoldKeyCollection } from "../../defines/IHoldKeyCollection";
import type { TNextFrame } from "../../defines/INextFrame";
import { IQube } from "../../defines/IQube";
import { wpoint_info_new, type IWpointInfo } from "../../defines/IWpointInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { xml_to_itr_info } from "./xml_to_itr_info";
import { xml_to_bdy_info } from "./xml_to_bdy_info";
import { xml_to_opoint } from "./xml_to_opoint";

/**
 * 解析 `<next>` / `<on_dead>` 等跳转目标
 */
export function xml_to_next_frame(el: IXMLElement): TNextFrame {
  const nf: TNextFrame = { id: el.str_attr("id") ?? "" };
  const wait = el.num_attr("wait");
  if (wait !== void 0) nf.wait = wait;
  const facing = el.num_attr("facing");
  if (facing !== void 0) nf.facing = facing;
  const mp = el.num_attr("mp");
  if (mp !== void 0) nf.mp = mp;
  const hp = el.num_attr("hp");
  if (hp !== void 0) nf.hp = hp;
  const expression = el.str_attr("expression") ?? el.first_by_tag("expression")?.text;
  if (expression) nf.expression = expression;
  const blink = el.num_attr("blink_time");
  if (blink !== void 0) nf.blink_time = blink;
  apply_velocity_shorthand(el, nf as any);
  return nf;
}

/**
 * 解析 `<pic>` 帧切图，支持 rect="x,y,w,h" 快捷属性
 */
function xml_to_pic(el: IXMLElement): IFramePictureInfo {
  const rect = el.nums_attr("rect");
  return {
    tex: el.str_attr("tex") ?? "0",
    x: el.num_attr("x") ?? rect?.[0] ?? 0,
    y: el.num_attr("y") ?? rect?.[1] ?? 0,
    w: el.num_attr("w") ?? rect?.[2] ?? 0,
    h: el.num_attr("h") ?? rect?.[3] ?? 0,
  };
}

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
 * 解析 `<wpoint>` 武器点
 */
function xml_to_wpoint(el: IXMLElement): IWpointInfo {
  return Object.assign(wpoint_info_new(), {
    kind: el.num_attr("kind") ?? 0,
    x: el.num_attr("x") ?? 0,
    y: el.num_attr("y") ?? 0,
    z: el.num_attr("z") ?? 0,
    weaponact: el.num_attr("weaponact"),
    attacking: el.num_attr("attacking"),
    dvx: el.num_attr("dvx"),
    dvy: el.num_attr("dvy"),
    dvz: el.num_attr("dvz"),
  });
}

/**
 * 解析 `<bpoint>` 灼烧点
 */
function xml_to_bpoint(el: IXMLElement): IBpointInfo {
  return Object.assign(bpoint_info_new(), {
    x: el.num_attr("x") ?? 0,
    y: el.num_attr("y") ?? 0,
    z: el.num_attr("z") ?? 0,
    r: el.num_attr("r") ?? 0,
  });
}

/**
 * 解析 `<cpoint>` 抓取点
 */
function xml_to_cpoint(el: IXMLElement): ICpointInfo {
  const cp = Object.assign(cpoint_info_new(), {
    kind: el.num_attr("kind"),
    x: el.num_attr("x") ?? 0,
    y: el.num_attr("y") ?? 0,
    z: el.num_attr("z") ?? 0,
    vaction: void 0 as TNextFrame | undefined,
    injury: el.num_attr("injury"),
    hurtable: el.num_attr("hurtable"),
    decrease: el.num_attr("decrease"),
  });
  const vaction = el.first_by_tag("vaction");
  if (vaction) cp.vaction = xml_to_next_frame(vaction);
  return cp;
}

/**
 * 解析 `<chase>` 跟踪
 */
function xml_to_chase(el: IXMLElement): IChaseInfo {
  return Object.assign(chase_info_new(), {
    stratedy: el.num_attr("stratedy") ?? 0,
    flag: el.num_attr("flag") ?? 0,
    lost: el.num_attr("lost"),
    oy: el.num_attr("oy"),
  });
}

/**
 * 解析按键映射集合（hit / hold / key_down / key_up）
 */
function xml_to_key_collection(el: IXMLElement): Record<string, TNextFrame> {
  const ret: Record<string, TNextFrame> = {};
  for (const child of el.children) {
    ret[child.tagName] = xml_to_next_frame(child);
  }
  return ret;
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

  const mergedNext = merge_by_tag(el, "next", xml_to_next_frame);
  if (mergedNext) ret.next = mergedNext;
  ret.on_dead = merge_by_tag(el, "on_dead", xml_to_next_frame);
  ret.on_landing = merge_by_tag(el, "on_landing", xml_to_next_frame);
  ret.on_exhaustion = merge_by_tag(el, "on_exhaustion", xml_to_next_frame);

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
  for (const child of el.children_by_tag("dataset")) {
    const v = child.values();
    for (const k of Object.keys(v)) (ret as any)[k] = v[k];
  }

  return ret;
}
