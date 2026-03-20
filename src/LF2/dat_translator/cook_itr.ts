import { FacingFlag, IFrameInfo, IItrInfo, ItrEffect, ItrKind } from "../defines";
import { is_num, not_zero_num } from "../utils/type_check";
import { fixed_float } from "./fixed_float";
import { get_next_frame_by_raw_id } from "./get_the_next";
import { take } from "./take";
import { take_not_zero_num } from "./take_not_zero_num";
import { take_positive_num } from "./take_positive_num";

export function cook_itr(itr?: Partial<IItrInfo>, frame?: IFrameInfo) {

  if (!itr) return;
  itr.vrest = take_positive_num(itr, "vrest", n => 2 * n)
  itr.arest = take_positive_num(itr, "arest", n => 2 * n)
  itr.dvx = take_not_zero_num(itr, "dvx", n => fixed_float(n, 4));
  itr.dvz = take_not_zero_num(itr, "dvz", n => fixed_float(n, 4));
  itr.dvy = take_not_zero_num(itr, "dvy", n => fixed_float(n, 4));
  itr.fall = take_not_zero_num(itr, "fall", n => n * 2);
  itr.bdefend = take_not_zero_num(itr, "bdefend", n => n * 2);
  const zwidth = take_not_zero_num(itr, "zwidth")
  if (not_zero_num(zwidth)) {
    itr.l = 4 * zwidth;
    itr.z = -2 * zwidth;
  }
  const kind_name = (ItrKind as any)[itr.kind!];
  if (kind_name) itr.kind_name = `ItrKind.${kind_name}`;
  if (itr.effect !== void 0) {
    const effect_name = ItrEffect[itr.effect as ItrEffect];
    if (effect_name) itr.effect_name = `ItrEffect.${effect_name}`;
  }
  const catchingact = take(itr, "catchingact");
  if (is_num(catchingact))
    itr.catchingact = get_next_frame_by_raw_id(catchingact);

  const caughtact = take(itr, "caughtact");
  if (is_num(caughtact))
    itr.caughtact = {
      ...get_next_frame_by_raw_id(caughtact),
      facing: FacingFlag.OpposingCatcher,
    };
}
