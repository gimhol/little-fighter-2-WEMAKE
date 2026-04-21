import { RGBA_MAP } from "./color_map";
import { hex_to_rgba } from "./hex_to_rgba";
import { int_to_rgba } from "./int_to_rgba";
import { IRGBA } from "./IRGBA";
const rgba_regexp = /^rgba\((.*),(.*),(.*),(.*)\)$/;
const argb_regexp = /^argb\((.*),(.*),(.*),(.*)\)$/;
const rgb_regexp = /^rgb\((.*),(.*),(.*)\)$/;
export function parse_rgba(raw: number | string | undefined | null): IRGBA | null {
  if (raw == null || raw == void 0) return null;
  if (typeof raw === 'number') {
    const known = RGBA_MAP.get(raw);
    if (known) return known;
    const ret = int_to_rgba(raw);
    RGBA_MAP.set(raw, ret);
    return ret;
  }

  if (typeof raw === 'string') {
    raw = raw.trim().toLowerCase();
    const known = RGBA_MAP.get(raw);
    if (known) return known;
    if (raw.startsWith('#')) {
      const ret = hex_to_rgba(raw.substring(1));
      RGBA_MAP.set(raw, ret);
      return ret;
    }
    let result = raw.match(rgba_regexp);
    if (result) {
      const ret = {
        r: parseInt(result[1]),
        g: parseInt(result[2]),
        b: parseInt(result[3]),
        a: parseFloat(result[4]),
      };
      RGBA_MAP.set(raw, ret);
      return ret;
    }
    result = raw.match(argb_regexp);
    if (result) {
      const ret = {
        r: parseInt(result[2]),
        g: parseInt(result[3]),
        b: parseInt(result[4]),
        a: parseFloat(result[1]),
      };
      RGBA_MAP.set(raw, ret);
      return ret;
    }
    result = raw.match(rgb_regexp);
    if (result) {
      const ret = {
        r: parseInt(result[1]),
        g: parseInt(result[2]),
        b: parseInt(result[3]),
        a: 1
      };
      RGBA_MAP.set(raw, ret);
      return ret;
    }
  }
  return null;
}
