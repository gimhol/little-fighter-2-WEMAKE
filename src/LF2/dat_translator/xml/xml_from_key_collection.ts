import type { IHitKeyCollection } from "../../defines/IHitKeyCollection";
import type { IHoldKeyCollection } from "../../defines/IHoldKeyCollection";
import type { TNextFrame } from "../../defines/INextFrame";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";
import { xml_from_next_frame } from "./xml_from_next_frame";

/**
 * 将 key→TNextFrame 映射写入父元素
 *
 * 每个非空成员作为独立子标签，引用 xml_from_next_frame 序列化
 * 若值为数组，则每个元素作为一个子标签
 */
function writeKeyMap(
  parent: IXMLElement,
  xml: IXMLFactory,
  map: Record<string, TNextFrame | undefined>,
): void {
  for (const [key, nf] of Object.entries(map)) {
    if (!nf) continue;
    if (Array.isArray(nf)) {
      for (const item of nf) {
        parent.insert(xml_from_next_frame(xml, item, key));
      }
    } else {
      parent.insert(xml_from_next_frame(xml, nf, key));
    }
  }
}

/**
 * 序列化 <hit>（来自 IHitKeyCollection）
 */
export function xml_from_hit_key(xml: IXMLFactory, hit: IHitKeyCollection): IXMLElement {
  const el = xml.create("hit");
  writeKeyMap(el, xml, hit as Record<string, TNextFrame | undefined>);
  return el;
}

/**
 * 序列化 <hold>（来自 IHoldKeyCollection）
 */
export function xml_from_hold_key(xml: IXMLFactory, hold: IHoldKeyCollection): IXMLElement {
  const el = xml.create("hold");
  writeKeyMap(el, xml, hold as Record<string, TNextFrame | undefined>);
  return el;
}
