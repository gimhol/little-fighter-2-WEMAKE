import type { IDialogInfo } from "../../defines/IDialogInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";

/**
 * 解析 <dialog> → IDialogInfo
 */
export function xml_to_dialog_info(el: IXMLElement): IDialogInfo {
  return {
    i18n: el.str_attr("i18n") ?? "",
    type: el.str_attr("type") as IDialogInfo["type"],
    fighter: el.str_attr("fighter"),
    pause: el.bool_attr("pause"),
    close_by: el.str_attr("close_by"),
    hide_stats: el.num_attr("hide_stats"),
    end_test: el.strs_attr("end_test"),
  };
}
