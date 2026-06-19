import type { TAction } from "../../defines/TAction";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXML } from "../../ditto/xml/IXML";

export function xml_from_colli_action(xml: IXML, action: TAction): IXMLElement {
  const ret = xml.create("colli_action");
  ret.set_str_attr("type", action.type);
  ret.set_str_attr("test", action.test);
  ret.set_bool_attr("pretest", action.pretest);
  const data = xml.from_object(action.data, "data");
  ret.insert(data);
  return ret;
}
