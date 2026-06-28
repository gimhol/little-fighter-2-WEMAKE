import type { TAction } from "../../defines/actions/TAction";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXML } from "../../ditto/xml/IXML";

export function xml_from_colli_action(xml: IXML, action: TAction, tag: string): IXMLElement {
  const ret = xml.create("action");
  ret.set_attr("type", action.type);
  ret.set_attr("test", action.test);
  ret.set_attr("pretest", action.pretest);
  const data = xml.from_object(action.data, "data");
  ret.insert(data);
  return ret;
}
