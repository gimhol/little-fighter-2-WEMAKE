import type { TNextFrame } from "../../defines";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { xml_to_next_frame } from "./xml_to_next_frame";

/**
 * 解析按键映射集合（hit / hold / key_down / key_up）
 */
export function xml_to_key_collection(el: IXMLElement): Record<string, TNextFrame> {
  const ret: Record<string, TNextFrame> = {};
  for (const child of el.children) {
    ret[child.tag] = xml_to_next_frame(child);
  }
  return ret;
}
