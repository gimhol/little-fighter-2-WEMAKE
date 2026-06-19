import { acos, cos, max, min, PI } from "../math/base";
import { type IEaseMethod } from "./IEaseMethod";

export function ease_in_out_sine(factor: number, from = 0, to = 1): number {
  return from - ((to - from) * (cos(PI * factor) - 1)) / 2;
}
ease_in_out_sine.backward = function (v: number, from = 0, to = 1): number {
  const _min = min(from, to);
  const _max = max(from, to);
  if (v < _min) v = _min;
  if (v > _max) v = _max;
  return acos((2 * (from - v)) / (to - from) + 1) / PI;
};

const exported: IEaseMethod = ease_in_out_sine;
export default exported;
