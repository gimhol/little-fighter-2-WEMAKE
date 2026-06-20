import type { INextFrame, TNextFrame } from "../../defines/INextFrame";
import type { IXML, IXMLElement } from "../../ditto/xml";
/**
 * 序列化 <next> 元素（来自 INextFrame）
 *
 * tagName 可指定标签名，默认 "next"
 */
export function xml_from_next_frame(
  xml: IXML,
  nf: INextFrame,
  tag: string = "next",
): IXMLElement {
  const el = xml.create(tag);

  el.set_strs_attr("id", nf.id);
  el.set_attr("wait", nf.wait);
  el.set_num_attr("facing", nf.facing);
  el.set_num_attr("mp", nf.mp);
  el.set_num_attr("hp", nf.hp);
  el.set_num_attr("blink_time", nf.blink_time);
  el.set_nums_attr_soft("dv", [nf.dvx, nf.dvy, nf.dvz]);
  el.set_nums_attr_soft("acc", [nf.acc_x, nf.acc_y, nf.acc_z]);
  el.set_nums_attr_soft("vm", [nf.vxm, nf.vym, nf.vzm]);
  el.set_nums_attr_soft("ctrl", [nf.ctrl_x, nf.ctrl_y, nf.ctrl_z]);

  el.set_strs_attr("sounds", nf.sounds);

  // expression → <expression>text</expression>
  if (nf.expression) {
    const expr = xml.create("expression");
    expr.set_text(nf.expression);
    el.insert(expr);
  }
  return el;
}

export function xml_from_t_next_frame(
  xml: IXML,
  nf: TNextFrame | undefined,
  tag: string = "next"
): IXMLElement[] {
  if (!nf) return [];
  const nfs = Array.isArray(nf) ? nf : nf ? [nf] : []
  if (!nfs.length) return [];
  return nfs.map(v => xml_from_next_frame(xml, v, tag))
}