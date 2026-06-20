import type { TAction } from "../../defines/TAction";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { xml_to_next_frame } from "./xml_to_next_frame";

/**
 * 解析 <colli_action> → TAction
 */
export function xml_to_colli_action(el: IXMLElement): TAction {
  const type = el.str_attr("type") ?? "";
  const test = el.str_attr("test");
  const pretest = el.bool_attr("pretest");

  switch (type) {
    case "a_sound":
    case "v_sound": {
      const path = el.strs_attr("path") ?? [];
      const posNums = el.nums_attr("pos");
      return {
        type, test, pretest,
        data: {
          path,
          pos: posNums ? { x: posNums[0] ?? 0, y: posNums[1] ?? 0, z: posNums[2] ?? 0 } : undefined,
        },
      } as TAction;
    }
    case "a_next_frame":
    case "v_next_frame":
    case "a_defend":
    case "v_defend":
    case "a_broken_defend":
    case "v_broken_defend": {
      const nfEl = el.child_by_tag("nf");
      return {
        type, test, pretest,
        data: nfEl ? xml_to_next_frame(nfEl) : { id: "" },
      } as TAction;
    }
    case "a_set_prop":
    case "v_set_prop":
      return {
        type, test, pretest,
        prop_name: el.str_attr("prop_name") ?? "",
        prop_value: el.str_attr("prop_value"),
      } as TAction;
    case "a_rebound_vx":
    case "v_rebound_vx":
      return { type, test, pretest } as TAction;
    case "v_turn_face":
    case "v_turn_team":
      return { type, test, pretest } as TAction;
    case "fusion": {
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
      } as TAction;
    }
    case "broadcast":
      return { type, test, pretest, data: { msg: el.str_attr("data") ?? "" } } as TAction;
    case "VALUE_STEAL":
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
      } as TAction;
    case "abuff":
    case "vbuff":
      return {
        type, test, pretest,
        data: {
          buff: el.str_attr("buff") ?? "",
          duration: el.num_attr("duration") ?? 0,
          hitflag: el.num_attr("hitflag") ?? 0,
        },
      } as TAction;
    default:
      return { type, test, pretest } as TAction;
  }
}