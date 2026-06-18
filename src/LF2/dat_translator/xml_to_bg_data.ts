import { Defines } from "../defines/defines";
import { bg_data_field_orders, bg_data_new, type IBgData } from "../defines/IBgData";
import { bg_layer_field_orders, type IBgLayerInfo } from "../defines/IBgLayerInfo";
import type { IXMLElement } from "../ditto/xml/IXMLElement";
import { sort_key_value } from "../utils/container_help/sort_key_value";

/**
 * 解析 `<base>` 元素为 IBgInfo
 * @param {IXMLElement} el - base 元素
 * @param {string} fallbackId - 无 name 时的回退 ID
 * @return {IBgData["base"]}
 */
export function xml_to_bg_base(el: IXMLElement, fallbackId: string): IBgData["base"] {
  const base: IBgData["base"] = {
    name: el.str_attr("name") ?? fallbackId,
    shadow: el.str_attr("shadow") ?? "",
    shadowsize: (el.nums_attr("shadowsize") as [number, number]) ?? [0, 0],
    group: (el.strs_attr("group") as IBgData["base"]["group"]) ?? ["regular"],
    left: el.num_attr("left") ?? 0,
    right: el.num_attr("right") ?? 0,
    far: el.num_attr("far") ?? 0,
    near: el.num_attr("near") ?? 0,
    height: el.num_attr("height") ?? Defines.MODERN_SCREEN_HEIGHT,
  };
  const zoom = el.nums_attr("zoom");
  if (zoom && zoom.length === 3) base.zoom = zoom as [number, number, number];
  return base;
}

/**
 * 解析 `<layer>` 元素为 IBgLayerInfo
 * @param {IXMLElement} el - layer 元素
 * @param {number} defaultZ - 默认 z 坐标
 * @return {IBgLayerInfo}
 */
export function xml_to_bg_layer(el: IXMLElement, defaultZ: number): IBgLayerInfo {
  const layer: IBgLayerInfo = {
    id: el.str_attr("id"),
    name: el.str_attr("name"),
    file: el.str_attr("file"),
    width: el.num_attr("width") ?? 0,
    height: el.num_attr("height") ?? 0,
    x: el.num_attr("x") ?? 0,
    y: el.num_attr("y") ?? 0,
    z: el.num_attr("z") ?? defaultZ,
    w: el.num_attr("w") ?? 0,
    h: el.num_attr("h") ?? 0,
  };
  const loop = el.num_attr("loop");
  if (loop !== void 0) layer.loop = loop;
  const absolute = el.num_attr("absolute");
  if (absolute !== void 0) layer.absolute = absolute;
  const color = el.str_attr("color");
  if (color !== void 0) layer.color = color;
  const cc = el.num_attr("cc");
  if (cc !== void 0) layer.cc = cc;
  const c1 = el.num_attr("c1");
  if (c1 !== void 0) layer.c1 = c1;
  const c2 = el.num_attr("c2");
  if (c2 !== void 0) layer.c2 = c2;
  const oax = el.num_attr("offsetAnimX");
  if (oax !== void 0) layer.offsetAnimX = oax;
  const oay = el.num_attr("offsetAnimY");
  if (oay !== void 0) layer.offsetAnimY = oay;
  sort_key_value(layer, bg_layer_field_orders);
  return layer;
}

export function xml_to_bg_data(el: IXMLElement): IBgData {
  const ret = bg_data_new();
  const id = el.attr("id");
  if (id) ret.id = id;

  // 允许多个 base 标签，同名属性后者覆盖前者
  for (const child of el.children_by_tag("base")) {
    Object.assign(ret.base, xml_to_bg_base(child, ret.id));
  }

  // <dataset> 可选元素
  const dsEl = el.first_by_tag("dataset");
  if (dsEl) ret.dataset = dsEl.values() as Partial<IBgData["dataset"]>;

  // <layer> 子元素
  for (const child of el.children_by_tag("layer")) {
    ret.layers.push(xml_to_bg_layer(child, ret.layers.length));
  }

  sort_key_value(ret, bg_data_field_orders);
  return ret;
}
