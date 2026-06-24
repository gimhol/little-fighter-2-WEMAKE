import { ActionType as AT } from "../../defines";
import type { TAction } from "../../defines/actions/TAction";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { xml_to_next_frame } from "./xml_to_next_frame";

/**
 * 解析 <colli_action> → TAction
 */
export function xml_to_colli_action(el: IXMLElement): TAction {
  const type = (el.str_attr("type") ?? "").toUpperCase() as AT;
  const test = el.str_attr("test");
  const pretest = el.bool_attr("pretest");

  if (!type) {
    return {
      type: AT.ERROR,
      data: {
        msg: "xml_to_colli_action failed, action type got empty"
      }
    }
  }
  switch (type) {
    case AT.A_SOUND:
    case AT.V_SOUND: {
      const path = el.strs_attr("path") ?? [];
      const posNums = el.nums_attr("pos");
      return {
        type, test, pretest,
        data: {
          path,
          pos: posNums ? {
            x: posNums[0] ?? 0,
            y: posNums[1] ?? 0,
            z: posNums[2] ?? 0
          } : undefined,
        },
      };
    }
    case AT.A_NEXT_FRAME:
    case AT.V_NEXT_FRAME:
    case AT.A_DEFEND:
    case AT.V_DEFEND:
    case AT.A_BROKEN_DEFEND:
    case AT.V_BROKEN_DEFEND: {
      const nfEl = el.child_by_tag("nf");
      return {
        type, test, pretest,
        data: nfEl ? xml_to_next_frame(nfEl) : { id: "" },
      };
    }
    case AT.A_SET_PROP:
    case AT.V_SET_PROP:
      return {
        type, test, pretest, data: {
          name: el.str_attr("prop_name") ?? "",
          value: el.str_attr("prop_value"),
        }
      };
    case AT.A_REBOUND_VX:
    case AT.V_REBOUND_VX:
      return { type, test, pretest };
    case AT.V_TURN_FACE:
    case AT.V_TURN_TEAM:
      return { type, test, pretest };
    case AT.FUSION: {
      const actEl = el.child_by_tag("act");
      const cancelKeys = el.strs_attr("cancel_keys")?.map(k => k.split(",").filter(Boolean));
      return {
        type, test, pretest,
        data: {
          oid: el.str_attr("oid") ?? "",
          act: actEl ? xml_to_next_frame(actEl) : undefined,
          time: el.num_attr("time"),
          cancel_keys: cancelKeys as any,
        },
      };
    }
    case AT.BROADCAST:
      return { type, test, pretest, data: { msg: el.str_attr("data") ?? "" } };
    case AT.VALUE_STEAL:
      return {
        type, test, pretest,
        data: {
          target: el.num_attr("target"),
          hp: el.num_attr("hp"),
          hp_r: el.num_attr("hp_r"),
          over_hp_r: el.num_attr("over_hp_r"),
          revive: el.num_attr("revive"),
          mp: el.num_attr("mp"),
          itr_hp_ratio: el.num_attr("itr_hp_ratio"),
          itr_hp_r_ratio: el.num_attr("itr_hp_r_ratio"),
          itr_mp_ratio: el.num_attr("itr_mp_ratio"),
          over_injury: el.num_attr("over_injury"),
        },
      };
    case AT.A_BUFF:
    case AT.V_BUFF:
      return {
        type, test, pretest,
        data: {
          buff: el.str_attr("buff") ?? "",
          duration: el.num_attr("duration") ?? 0,
          hitflag: el.num_attr("hitflag") ?? 0,
        },
      };
    case AT.ERROR:
    default:
      return {
        type: AT.ERROR,
        data: {
          msg: "xml_to_colli_action failed, supported action type: " + type
        }
      }
  }
}