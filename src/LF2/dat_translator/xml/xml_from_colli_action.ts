import type { TAction } from "../../defines/TAction";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import type { IXMLFactory } from "./xml_from_bg_data";
import { xml_from_next_frame } from "./xml_from_next_frame";

/**
 * 序列化 <colli_action>
 */
export function xml_from_colli_action(xml: IXMLFactory, action: TAction): IXMLElement {
  const el = xml.create("colli_action");
  el.set_str_attr("type", action.type);
  el.set_str_attr("test", action.test);
  el.set_bool_attr("pretest", action.pretest);

  switch (action.type) {
    case "a_sound":
    case "v_sound": {
      const d = action.data;
      el.set_strs_attr("path", d.path);
      if (d.pos) {
        el.set_nums_attr("pos", [d.pos.x, d.pos.y, d.pos.z]);
      }
      break;
    }
    case "a_next_frame":
    case "v_next_frame":
    case "a_defend":
    case "v_defend":
    case "a_broken_defend":
    case "v_broken_defend":
      el.insert(xml_from_next_frame(xml, action.data, "nf"));
      break;
    case "a_set_prop":
    case "v_set_prop":
      el.set_str_attr("prop_name", action.prop_name);
      el.set_str_attr("prop_value", String(action.prop_value));
      break;
    case "a_rebound_vx":
    case "v_rebound_vx":
    case "v_turn_face":
    case "v_turn_team":
      break;
    case "fusion": {
      const d = action.data;
      el.set_str_attr("oid", d.oid);
      if (d.act) el.insert(xml_from_next_frame(xml, d.act, "act"));
      el.set_num_attr("time", d.time);
      el.set_strs_attr("cancel_keys", d.cancel_keys?.map(k => k.join(",")));
      break;
    }
    case "broadcast":
      el.set_str_attr("data", action.data);
      break;
    case "VALUE_STEAL": {
      const d = action.data;
      el.set_num_attr("target", d.target);
      el.set_num_attr("hp", d.hp);
      el.set_num_attr("hp_r", d.hp_r);
      el.set_num_attr("over_hp_r", d.over_hp_r);
      el.set_num_attr("revive", d.revive);
      el.set_num_attr("mp", d.mp);
      el.set_num_attr("itr_hp_ratio", d.itr_hp_ratio);
      el.set_num_attr("itr_hp_r_ratio", d.itr_hp_r_ratio);
      el.set_num_attr("itr_mp_ratio", d.itr_mp_ratio);
      el.set_num_attr("over_injury", d.over_injury);
      break;
    }
    case "abuff":
    case "vbuff": {
      const d = action.data;
      el.set_str_attr("buff", d.buff);
      el.set_num_attr("duration", d.duration);
      el.set_num_attr("hitflag", d.hitflag);
      break;
    }
  }

  return el;
}
