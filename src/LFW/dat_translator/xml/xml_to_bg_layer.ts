import { type IBgLayerInfo, bg_layer_info_fields } from "../../defines";
import type { IXMLElement } from "../../ditto";
import { reorder_keys } from "../../fields";

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
  reorder_keys(layer, bg_layer_info_fields);
  return layer;
}
