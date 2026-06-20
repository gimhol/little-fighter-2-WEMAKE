import { acos, max, min, PI, pow } from "../math";

export function ease_in_out_quint(factor: number, from = 0, to = 1): number {
  const ratio =
    factor < 0.5 ? 16 * factor ** 5 : 1 - pow(-2 * factor + 2, 5) / 2;
  return from + ratio * (to - from);
}

ease_in_out_quint.backward = function (v: number, from = 0, to = 1): number {
  const _min = min(from, to);
  const _max = max(from, to);
  if (v < _min) v = _min;
  if (v > _max) v = _max;
  const ratio = (v - from) / (to - from);
  return acos(-2 * ratio + 1) / PI;
};
