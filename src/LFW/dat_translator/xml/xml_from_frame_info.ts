import type { IFrameInfo } from "../../defines/IFrameInfo";
import type { IXML, IXMLElement } from "../../ditto/xml";
import { xml_from_bdy_info } from "./xml_from_bdy_info";
import { xml_from_itr_info } from "./xml_from_itr_info";
import { xml_from_hit_key, xml_from_hold_key } from "./xml_from_key_collection";
import { xml_from_t_next_frame } from "./xml_from_next_frame";
import { xml_from_opoint } from "./xml_from_opoint";

/**
 * 序列化 <frame>
 */
export function xml_from_frame_info(xml: IXML, id: string, frame: IFrameInfo): IXMLElement | null {
  const el = xml.create("frame");
  el.set_attr("id", id);

  // pic (required)
  if (!frame.pic) return null;
  const pic = xml.create("pic");
  pic.set_attr("tex", frame.pic.tex);
  pic.set_attr("x", frame.pic.x);
  pic.set_attr("y", frame.pic.y);
  pic.set_attr("w", frame.pic.w);
  pic.set_attr("h", frame.pic.h);
  el.insert(pic);

  xml_from_t_next_frame(xml, frame.next, 'next')?.forEach(v => {
    el.insert(v);
  })

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
    b.set_attr("x", frame.bpoint.x);
    b.set_attr("y", frame.bpoint.y);
    b.set_attr("z", frame.bpoint.z);
    b.set_attr("r", frame.bpoint.r);
    el.insert(b);
  }
  if (frame.wpoint) {
    const w = xml.create("wpoint");
    w.set_attr("kind", frame.wpoint.kind as number);
    w.set_attr("x", frame.wpoint.x);
    w.set_attr("y", frame.wpoint.y);
    w.set_attr("z", frame.wpoint.z);
    w.set_attr("weaponact", frame.wpoint.weaponact);
    w.set_attr("attacking", frame.wpoint.attacking);
    w.set_arr_attr_soft("dv", [frame.wpoint.dvx, frame.wpoint.dvy, frame.wpoint.dvz]);
    el.insert(w);
  }
  if (frame.cpoint) {
    const c = xml.create("cpoint");
    c.set_attr("kind", frame.cpoint.kind);
    c.set_attr("x", frame.cpoint.x);
    c.set_attr("y", frame.cpoint.y);
    c.set_attr("z", frame.cpoint.z);
    c.set_attr("injury", frame.cpoint.injury);
    c.set_attr("hurtable", frame.cpoint.hurtable);
    c.set_attr("decrease", frame.cpoint.decrease);
    c.set_arr_attr_soft("throwv", [frame.cpoint.throwvx, frame.cpoint.throwvy, frame.cpoint.throwvz]);
    c.set_attr("throwinjury", frame.cpoint.throwinjury);
    c.set_attr("fronthurtact", frame.cpoint.fronthurtact);
    c.set_attr("backhurtact", frame.cpoint.backhurtact);
    c.set_attr("shaking", frame.cpoint.shaking);
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
