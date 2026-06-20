import type { IOpointMulti } from "../../defines/IOpointInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";

/**
 * 解析 <multi> → IOpointMulti
 */
export function xml_to_opoint_multi(el: IXMLElement): IOpointMulti {
  const type = el.num_attr("type");
  const ret: IOpointMulti = {
    type: type ?? 0,
  };
  const skip_zero = el.bool_attr("skip_zero");
  if (skip_zero !== void 0) ret.skip_zero = skip_zero;
  const min = el.num_attr("min");
  if (min !== void 0) ret.min = min;
  const max = el.num_attr("max");
  if (max !== void 0) ret.max = max;
  return ret;
}
