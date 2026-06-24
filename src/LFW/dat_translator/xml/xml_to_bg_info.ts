import { Defines } from "../..";
import type { IBgInfo } from "../../defines";
import type { IXMLElement } from "../../ditto";

/**
 * 解析 `<base>` 元素为 IBgInfo
 * @param {IXMLElement} el - base 元素
 * @param {string} fallbackId - 无 name 时的回退 ID
 * @return {IBgData["base"]}
 */

export function xml_to_bg_info(el: IXMLElement, fallbackId: string): IBgInfo {
  const base: IBgInfo = {
    name: el.get_str("name") ?? fallbackId,
    shadow: el.get_str("shadow") ?? "",
    group: el.get_str_arr("group") ?? ["regular"],
    left: el.get_num("left") ?? 0,
    right: el.get_num("right") ?? 0,
    far: el.get_num("far") ?? 0,
    near: el.get_num("near") ?? 0,
    height: el.get_num("height") ?? Defines.MODERN_SCREEN_HEIGHT,
    shadow_w: el.get_num('shadow_w') ?? 0,
    shadow_h: el.get_num('shadow_h') ?? 0,
    zoom_x: el.get_num('zoom_x') ?? 0,
    zoom_y: el.get_num('zoom_y') ?? 0,
    zoom_z: el.get_num('zoom_z') ?? 0,
  };

  const bound = el.get_num_arr("bound");
  if (bound && bound.length > 0) base.left ??= bound[0];
  if (bound && bound.length > 1) base.right ??= bound[1];
  if (bound && bound.length > 2) base.far ??= bound[2];
  if (bound && bound.length > 3) base.near ??= bound[3];

  const zoom = el.get_num_arr("zoom");
  base.zoom_x ??= zoom?.[0];
  base.zoom_y ??= zoom?.[1];
  base.zoom_z ??= zoom?.[2];
  const shadowsize = el.get_num_arr("shadowsize");
  if (shadowsize && shadowsize.length > 0) base.shadow_w ??= shadowsize[0];
  if (shadowsize && shadowsize.length > 1) base.shadow_h ??= shadowsize[1];
  return base;
}
