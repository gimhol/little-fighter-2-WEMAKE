import type { IDialogInfo } from "../../defines/IDialogInfo";
import type { IXMLElement, IXML } from "../../ditto/xml";

/**
 * 序列化 <dialog>
 */
export function xml_from_dialog_info(xml: IXML, d: IDialogInfo): IXMLElement {
  const el = xml.create("dialog");

  el.set_str_attr("type", d.type);
  el.set_str_attr("fighter", d.fighter);
  el.set_bool_attr("pause", d.pause);
  el.set_str_attr("i18n", d.i18n);
  el.set_str_attr("close_by", d.close_by);
  el.set_num_attr("hide_stats", d.hide_stats);
  el.set_strs_attr("end_test", d.end_test);

  return el;
}
