import type { IFrameInfo } from "../../defines/IFrameInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { xml_from_bdy_info } from "./xml_from_bdy_info";
import type { IXMLFactory } from "./xml_from_bg_data";
import { xml_from_itr_info } from "./xml_from_itr_info";
import { xml_from_opoint } from "./xml_from_opoint";
import { xml_from_hit_key, xml_from_hold_key } from "./xml_from_key_collection";
import { writeXmlAttrs } from "./xml_from_write";

/**
 * 序列化 <frame>
 */
export function xml_from_frame_info(xml: IXMLFactory, id: string, frame: IFrameInfo): IXMLElement | null {
  const el = xml.create("frame");
  el.set_attr("id", id);

  // pic (required)
  if (!frame.pic) return null;
  const pic = xml.create("pic");
  writeXmlAttrs(pic, frame.pic as any, ["tex", "x", "y", "w", "h"]);
  el.insert(pic);

  // next
  if (frame.next) {
    const n = xml.create("next");
    writeXmlAttrs(n, frame.next as any);
    el.insert(n);
  }

  // hit / hold / key_down / key_up
  if (frame.hit) {
    el.insert(xml_from_hit_key(xml, frame.hit));
  }
  if (frame.hold) {
    el.insert(xml_from_hold_key(xml, frame.hold));
  }
  if (frame.key_down) {
    el.insert(xml_from_hold_key(xml, frame.key_down));
  }
  if (frame.key_up) {
    el.insert(xml_from_hold_key(xml, frame.key_up));
  }

  // bpoint / wpoint / cpoint (single)
  if (frame.bpoint) {
    const b = xml.create("bpoint");
    writeXmlAttrs(b, frame.bpoint as any);
    el.insert(b);
  }
  if (frame.wpoint) {
    const w = xml.create("wpoint");
    writeXmlAttrs(w, frame.wpoint as any);
    el.insert(w);
  }
  if (frame.cpoint) {
    const c = xml.create("cpoint");
    writeXmlAttrs(c, frame.cpoint as any);
    el.insert(c);
  }

  // bdy[]
  if (frame.bdy) {
    for (const b of frame.bdy) {
      el.insert(xml_from_bdy_info(xml, b));
    }
  }

  // itr[]
  if (frame.itr) {
    for (const i of frame.itr) {
      el.insert(xml_from_itr_info(xml, i));
    }
  }

  // opoint[]
  if (frame.opoint) {
    for (const o of frame.opoint) {
      el.insert(xml_from_opoint(xml, o));
    }
  }

  return el;
}
