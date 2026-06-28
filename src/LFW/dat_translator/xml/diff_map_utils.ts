import type { Difficulty } from "../../defines/Difficulty";
import type { IXMLElement } from "../../ditto/xml";

/**
 * 难度映射序列化：若所有值相同则写数字，否则写 "difficulty:value,..."
 */
export function write_diff_map(el: IXMLElement, attr: string, map: Record<number, number> | undefined): void {
  if (!map || !Object.keys(map).length) return;
  const vals = Object.values(map);
  if (new Set(vals).size === 1) {
    el.set_attr(attr, vals[0]);
  } else {
    el.set_attr(attr, Object.entries(map).map(([d, n]) => `${d}:${n}`).join(","));
  }
}

/**
 * 解析难度映射：支持单数字（应用到所有难度）或 "difficulty:value,..." 格式
 */
export function parse_diff_map(el: IXMLElement, attr: string): { [x in Difficulty]?: number } | undefined {
  const v = el.strs_attr(attr, ",");
  if (!v) {
    const num = el.num_attr(attr);
    return num !== void 0 ? { 1: num, 2: num, 3: num, 4: num } : void 0;
  }
  const ret: Record<number, number> = {};
  for (const pair of v) {
    const [d, n] = pair.split(":").map(s => s.trim());
    if (d && n) {
      const dn = Number(d);
      if (!isNaN(dn)) ret[dn] = Number(n);
    }
  }
  return Object.keys(ret).length ? ret : void 0;
}
