import { type IItrInfo, itr_info_new } from "../../defines/IItrInfo";
import type { IXMLElement } from "../../ditto/xml/IXMLElement";
import { xml_to_t_next_frame } from "./xml_to_next_frame";
import { xml_to_qube } from "./xml_to_qube";
import { xml_to_velocity_info } from "./xml_to_velocity_info";

export function xml_to_itr_info(el: IXMLElement): IItrInfo {
  const ret = itr_info_new();

  ret.id = el.get_str("id", ret.id);
  if (ret.id === void 0) delete ret.id;

  ret.name = el.get_str("name", ret.name);
  if (ret.name === void 0) delete ret.name;

  ret.kind = el.get_num("kind", ret.kind);

  ret.injury = el.get_num("injury", ret.injury);
  if (ret.injury === void 0) delete ret.injury;

  ret.bdefend = el.get_num("bdefend", ret.bdefend);
  if (ret.bdefend === void 0) delete ret.bdefend;

  ret.motionless = el.get_num("motionless", ret.motionless);
  if (ret.motionless === void 0) delete ret.motionless;

  ret.shaking = el.get_num("shaking", ret.shaking);
  if (ret.shaking === void 0) delete ret.shaking;

  ret.dvx = el.get_num("dvx", ret.dvx);
  ret.dvy = el.get_num("dvy", ret.dvy);
  ret.dvz = el.get_num("dvz", ret.dvz);
  
  if (ret.dvx === void 0) delete ret.dvx;
  if (ret.dvy === void 0) delete ret.dvy;
  if (ret.dvz === void 0) delete ret.dvz;

  ret.effect = el.get_num("effect", ret.effect);
  if (ret.effect === void 0) delete ret.effect;

  ret.fall = el.get_num("fall", ret.fall);
  if (ret.fall === void 0) delete ret.fall;

  ret.vrest = el.get_num("vrest", ret.vrest);
  if (ret.vrest === void 0) delete ret.vrest;

  ret.arest = el.get_num("arest", ret.arest);
  if (ret.arest === void 0) delete ret.arest;

  ret.hit_flag = el.get_num("hit_flag", ret.hit_flag);
  if (ret.hit_flag === void 0) delete ret.hit_flag;

  ret.ref = el.get_str("ref") ?? el.get_str("prefab_id") ?? ret.ref;
  if (ret.ref === void 0) delete ret.ref;

  ret.catchingact = xml_to_t_next_frame(el.children_by_tag('catchingact'))
  if (ret.catchingact === void 0) delete ret.catchingact;

  ret.caughtact = xml_to_t_next_frame(el.children_by_tag('caughtact'))
  if (ret.caughtact === void 0) delete ret.caughtact;

  ret.on_hit_ground = xml_to_t_next_frame(el.children_by_tag('on_hit_ground'))
  if (ret.on_hit_ground === void 0) delete ret.on_hit_ground;

  ret.test = el.get_str("test", ret.test);
  if (!ret.test) delete ret.test;

  ret.code = el.get_num("code", ret.code);
  if (ret.code === void 0) delete ret.code;

  xml_to_velocity_info(el, ret);
  xml_to_qube(el, ret)
  return ret;
}
