import { IFrameInfo, IWpointInfo } from "../defines";
import { not_zero_num } from "../utils/type_check";
import { take } from "./take";
import { take_not_zero_num } from "./take_not_zero_num";

export function cook_wpoint(unsure_wpoint: IWpointInfo, frame: IFrameInfo) {
  const dvx = take(unsure_wpoint, "dvx");
  if (not_zero_num(dvx)) unsure_wpoint.dvx = dvx * 0.5;

  const dvz = take(unsure_wpoint, "dvz");
  if (not_zero_num(dvz)) unsure_wpoint.dvz = dvz;

  const dvy = take(unsure_wpoint, "dvy");
  if (not_zero_num(dvy)) unsure_wpoint.dvy = dvy * -0.5;

  const attacking = take(unsure_wpoint, "attacking");
  if (attacking) unsure_wpoint.attacking = "" + attacking;

  unsure_wpoint.z = 0;
  if (unsure_wpoint.kind == 1) {
    const cover = take_not_zero_num(unsure_wpoint, "cover", n => n);
    unsure_wpoint.z = cover == 1 ? -2 : 2;
  }
}
