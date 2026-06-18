import type { IBgData } from "../defines/IBgData";
import type { IBgLayerInfo } from "../defines/IBgLayerInfo";

const ESC: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" };
const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ESC[c]);

function attrs(obj: Record<string, unknown>): string {
  let out = "";
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) {
      out += ` ${key}="${esc(v.join(","))}"`;
    } else {
      out += ` ${key}="${esc(String(v))}"`;
    }
  }
  return out;
}

const LAYER_NUM_KEYS: (keyof IBgLayerInfo)[] = [
  "width", "height", "x", "y", "z", "w", "h",
  "loop", "absolute", "cc", "c1", "c2",
  "offsetAnimX", "offsetAnimY",
];

export function bg_data_to_xml(data: IBgData): string {
  const { id, base, layers, dataset } = data;

  // <base>
  const baseAttrs: Record<string, unknown> = {
    name: base.name,
    shadow: base.shadow,
    shadowsize: base.shadowsize,
    group: base.group,
    left: base.left,
    right: base.right,
    far: base.far,
    near: base.near,
  };
  if (base.height && base.height !== 600) baseAttrs.height = base.height;
  if (base.zoom) baseAttrs.zoom = base.zoom;

  let xml = `<background id="${esc(id)}">\n`;
  xml += `  <base${attrs(baseAttrs)} />\n`;

  // <dataset>
  if (dataset && Object.keys(dataset).length) {
    const dsAttrs: Record<string, unknown> = {};
    for (const k of Object.keys(dataset)) {
      dsAttrs[k] = (dataset as any)[k];
    }
    xml += `  <dataset${attrs(dsAttrs)} />\n`;
  }

  // <layer>
  for (const l of layers) {
    const layerAttrs: Record<string, unknown> = {};
    for (const k of LAYER_NUM_KEYS) {
      const v = (l as any)[k];
      if (v !== undefined && v !== null && v !== 0) layerAttrs[k] = v;
    }
    if (l.id) layerAttrs.id = l.id;
    if (l.name) layerAttrs.name = l.name;
    if (l.file) layerAttrs.file = l.file;
    if (l.color) layerAttrs.color = l.color;
    xml += `  <layer${attrs(layerAttrs)} />\n`;
  }

  xml += `</background>\n`;
  return xml;
}
