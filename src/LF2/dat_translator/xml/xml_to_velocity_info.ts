import type { IVelocityInfo } from "@/LF2/defines";
import type { IXMLElement } from "@/LF2/ditto";


export function xml_to_velocity_info(el: IXMLElement, out: IVelocityInfo = {}): IVelocityInfo {

  out.dvx = el.get_num("dvx", out.dvx);
  out.dvy = el.get_num("dvy", out.dvy);
  out.dvz = el.get_num("dvz", out.dvz);
  out.acc_x = el.get_num("acc_x", out.acc_x);
  out.acc_y = el.get_num("acc_y", out.acc_y);
  out.acc_z = el.get_num("acc_z", out.acc_z);
  out.vxm = el.get_num("vxm", out.vxm);
  out.vym = el.get_num("vym", out.vym);
  out.vzm = el.get_num("vzm", out.vzm);
  out.ctrl_x = el.get_num("ctrl_x", out.ctrl_x);
  out.ctrl_y = el.get_num("ctrl_y", out.ctrl_y);
  out.ctrl_z = el.get_num("ctrl_z", out.ctrl_z);

  const dv = el.nums_attr_soft("dv");
  if (typeof dv?.[0] === 'number') out.dvx = dv[0];
  if (typeof dv?.[1] === 'number') out.dvy = dv[1];
  if (typeof dv?.[2] === 'number') out.dvz = dv[2];

  const acc = el.nums_attr_soft("acc");
  if (typeof acc?.[0] === 'number') out.acc_x = acc[0];
  if (typeof acc?.[1] === 'number') out.acc_y = acc[1];
  if (typeof acc?.[2] === 'number') out.acc_z = acc[2];

  const vm = el.nums_attr_soft("vm");
  if (typeof vm?.[0] === 'number') out.vxm = vm[0];
  if (typeof vm?.[1] === 'number') out.vym = vm[1];
  if (typeof vm?.[2] === 'number') out.vzm = vm[2];

  const ctrl = el.nums_attr_soft("ctrl");
  if (typeof ctrl?.[0] === 'number') out.ctrl_x = ctrl[0];
  if (typeof ctrl?.[1] === 'number') out.ctrl_y = ctrl[1];
  if (typeof ctrl?.[2] === 'number') out.ctrl_z = ctrl[2];

  if (out.dvx === void 0) delete out.dvx;
  if (out.dvy === void 0) delete out.dvy;
  if (out.dvz === void 0) delete out.dvz;
  if (out.acc_x === void 0) delete out.acc_x;
  if (out.acc_y === void 0) delete out.acc_y;
  if (out.acc_z === void 0) delete out.acc_z;
  if (out.vxm === void 0) delete out.vxm;
  if (out.vym === void 0) delete out.vym;
  if (out.vzm === void 0) delete out.vzm;
  if (out.ctrl_x === void 0) delete out.ctrl_x;
  if (out.ctrl_y === void 0) delete out.ctrl_y;
  if (out.ctrl_z === void 0) delete out.ctrl_z;
  return out;
}
