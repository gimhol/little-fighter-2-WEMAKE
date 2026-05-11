import { LF2 } from "..";
import { IOpointInfo, OpointSpreading } from "../defines";
import { Randoming } from "../helper";
import { round_float } from "../utils";

export function preprocess_opoint(opoint: IOpointInfo, lf2: LF2): IOpointInfo {
  if (opoint.spreading == OpointSpreading.Spreading) {
    if (opoint.spreading_x?.length) opoint.__spreading_random_x = new Randoming(opoint.spreading_x, lf2);
    if (opoint.spreading_y?.length) opoint.__spreading_random_y = new Randoming(opoint.spreading_y, lf2);
    if (opoint.spreading_z?.length) opoint.__spreading_random_z = new Randoming(opoint.spreading_z, lf2);
  } else if (opoint.spreading == OpointSpreading.FloatRange) {
    const { spreading_x: xx, spreading_y: yy, spreading_z: zz } = opoint;
    if (xx?.length == 3)
      opoint.__spreading_random_x = { take: () => round_float(lf2.mt.range(xx[0], xx[1]) / xx[2]) };
    if (yy?.length == 3)
      opoint.__spreading_random_y = { take: () => round_float(lf2.mt.range(yy[0], yy[1]) / yy[2]) };
    if (zz?.length == 3)
      opoint.__spreading_random_z = { take: () => round_float(lf2.mt.range(zz[0], zz[1]) / zz[2]) };
  }
  return opoint
}
preprocess_opoint.TAG = "preprocess_opoint";