import { FacingFlag, IFrameInfo, IOpointInfo } from "../defines";
import { round } from "../utils/math/base";
import { is_num, not_zero_num } from "../utils/type_check";
import { get_next_frame_by_raw_id } from "./get_the_next";
import { take } from "./take";
export function cook_opoint(opoint: IOpointInfo, frame: IFrameInfo) {
  const action = take(opoint, "action");
  opoint.oid = "" + take(opoint, "oid");

  if (is_num(action)) {
    const act = get_next_frame_by_raw_id(action);
    const facing = take(opoint, "facing");
    if (is_num(facing)) {
      act.facing =
        facing % 2 ? FacingFlag.Backward : FacingFlag.None;
      if (facing >= 2 && facing <= 19) {
        act.facing = FacingFlag.Right;
      } else if (facing >= 20) {
        opoint.multi = round(facing / 10);
      }
    } else {
      act.facing = FacingFlag.None;
    }
    opoint.action = act;
  }

  const dvx = take(opoint, "dvx");
  if (not_zero_num(dvx)) opoint.dvx = dvx * 0.5;
  else opoint.dvx = 0;

  const dvz = take(opoint, "dvz");
  if (not_zero_num(dvz)) opoint.dvz = dvz * 0.5;

  const dvy = take(opoint, "dvy");
  if (not_zero_num(dvy)) opoint.dvy = dvy * -0.5;
}
