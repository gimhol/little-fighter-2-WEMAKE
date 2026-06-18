import { Defines } from "../defines/defines";
import { bg_data_field_orders, type IBgData } from "../defines/IBgData";
import { bg_layer_field_orders, type IBgLayerInfo } from "../defines/IBgLayerInfo";
import type { IXMLElement } from "../ditto/IXMLElement";
import { sort_key_value } from "../utils/container_help/sort_key_value";
import { to_num } from "../utils/type_cast/to_num";

export function xml_to_bg_data(el: IXMLElement): IBgData {
  const baseEl = el.children.find((c) => c.tagName === "base");
  const baseValues = baseEl?.values() ?? {};

  const base: IBgData["base"] = {
    name: baseValues.name ?? el.attr("id") ?? "",
    shadow: baseValues.shadow ?? "",
    shadowsize:
      (baseEl?.nums_attr("shadowsize") as [number, number]) ?? [0, 0],
    group: (baseEl?.strs_attr("group") ?? ["regular"]) as IBgData["base"]["group"],
    left: to_num(baseValues.left) ?? 0,
    right: to_num(baseValues.right) ?? 0,
    far: to_num(baseValues.far) ?? 0,
    near: to_num(baseValues.near) ?? 0,
    height: to_num(baseValues.height) ?? Defines.MODERN_SCREEN_HEIGHT,
  };

  if (baseEl) {
    const zoom = baseEl.nums_attr("zoom");
    if (zoom && zoom.length === 3) base.zoom = zoom as [number, number, number];
  }

  // <dataset> 可选元素
  const datasetEl = el.children.find((c) => c.tagName === "dataset");
  const dataset = datasetEl?.values() ?? {};

  // <layer> 子元素
  const layers: IBgLayerInfo[] = [];
  for (const child of el.children) {
    if (child.tagName !== "layer") continue;
    const v = child.values();
    const layer: IBgLayerInfo = {
      id: v.id,
      name: v.name,
      file: v.file,
      width: to_num(v.width) ?? 0,
      height: to_num(v.height) ?? 0,
      x: to_num(v.x) ?? 0,
      y: to_num(v.y) ?? 0,
      z: to_num(v.z) ?? layers.length,
      w: to_num(v.w) ?? 0,
      h: to_num(v.h) ?? 0,
    };
    if (v.loop !== undefined) layer.loop = to_num(v.loop);
    if (v.absolute !== undefined) layer.absolute = to_num(v.absolute);
    if (v.color !== undefined) layer.color = v.color;
    if (v.cc !== undefined) layer.cc = to_num(v.cc);
    if (v.c1 !== undefined) layer.c1 = to_num(v.c1);
    if (v.c2 !== undefined) layer.c2 = to_num(v.c2);
    if (v.offsetAnimX !== undefined) layer.offsetAnimX = to_num(v.offsetAnimX);
    if (v.offsetAnimY !== undefined) layer.offsetAnimY = to_num(v.offsetAnimY);
    sort_key_value(layer, bg_layer_field_orders);
    layers.push(layer);
  }

  const ret: IBgData = {
    type: "background",
    id: el.attr("id") ?? base.name,
    base,
    layers,
  };

  if (Object.keys(dataset).length) {
    ret.dataset = dataset;
  }

  sort_key_value(ret, bg_data_field_orders);
  return ret;
}
