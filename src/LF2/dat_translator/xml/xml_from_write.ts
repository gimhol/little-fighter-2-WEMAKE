import type { IXMLElement } from "../../ditto/xml/IXMLElement";

/**
 * 将 data 的属性写入 elem 的 XML 属性中（共享工具）
 */
export function writeXmlAttrs(elem: IXMLElement, data: Record<string, unknown>, keys?: string[]): void {
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
 * 从对象中选取非零 / 非空值写入属性
 */
export function writeNonZeroAttr(elem: IXMLElement, data: Record<string, unknown>, keys: string[]): void {
  for (const k of keys) {
    const v = (data as any)[k];
    if (v === undefined || v === null || v === 0 || v === "") continue;
    if (typeof v === "number") elem.set_num_attr(k, v);
    else if (Array.isArray(v)) elem.set_strs_attr(k, v.map(String));
    else elem.set_str_attr(k, String(v));
  }
}
