import type { IBgData } from "../../defines/IBgData";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";

/**
 * XML 工厂：只需 create(tag) 即可构建元素树
 */
export interface IXMLFactory {
  create(tag: string): IXMLElement;
}

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
 * 序列化背景数据为 XML 元素树，再 stringify 输出
 */
export function xml_from_bg_data(xml: IXMLFactory, data: IBgData): string {
  const root = xml.create("background");
  root.set_attr("id", data.id);

  // <base>
  const baseEl = xml.create("base");
  writeAttrs(baseEl, data.base as any, [
    "name", "shadow",
    "left", "right", "far", "near",
  ]);
  if (data.base.shadowsize) baseEl.set_str_attr("shadowsize", data.base.shadowsize.join(","));
  if (data.base.group?.length) baseEl.set_strs_attr("group", data.base.group as string[]);
  if (data.base.height && data.base.height !== 600) baseEl.set_num_attr("height", data.base.height);
  if (data.base.zoom) baseEl.set_str_attr("zoom", data.base.zoom.join(","));
  root.insert(baseEl);

  // <dataset>
  if (data.dataset && Object.keys(data.dataset).length) {
    const ds = xml.create("dataset");
    for (const [k, v] of Object.entries(data.dataset)) {
      if (v !== undefined && v !== null) ds.set_str_attr(k, String(v));
    }
    root.insert(ds);
  }

  // <layer>...
  for (const l of data.layers) {
    const layer = xml.create("layer");
    writeAttrs(layer, l as any, [
      "width", "height", "x", "y", "z", "w", "h",
      "loop", "absolute", "cc", "c1", "c2",
      "offsetAnimX", "offsetAnimY",
      "id", "name", "file", "color",
    ]);
    root.insert(layer);
  }

  return root.stringify();
}
