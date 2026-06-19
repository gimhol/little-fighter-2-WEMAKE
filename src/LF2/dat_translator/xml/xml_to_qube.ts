import type { IQube } from "../..//defines/IQube";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";

export function xml_to_qube(el: IXMLElement, out: IQube): IQube;
export function xml_to_qube(el: IXMLElement, out?: Partial<IQube>): Partial<IQube>;
export function xml_to_qube(el: IXMLElement, out: Partial<IQube> = {}): Partial<IQube> {
  const a = el.nums_attr("rect");
  const b = el.nums_attr("qube");
  out.x = el.get_num("x", a?.[0] ?? b?.[0] ?? out.x);
  out.y = el.get_num("y", a?.[1] ?? b?.[1] ?? out.y);
  out.w = el.get_num("w", a?.[2] ?? b?.[2] ?? out.w);
  out.h = el.get_num("h", a?.[3] ?? b?.[3] ?? out.h);
  out.z = el.get_num("z", a?.[4] ?? b?.[4] ?? out.z);
  out.l = el.get_num("l", a?.[5] ?? b?.[5] ?? out.l);
  if (out.x == void 0) delete out.x;
  if (out.y == void 0) delete out.y;
  if (out.w == void 0) delete out.w;
  if (out.h == void 0) delete out.h;
  if (out.z == void 0) delete out.z;
  if (out.l == void 0) delete out.l;
  return out;
}
