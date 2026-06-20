import type { IEaseMethod } from "./IEaseMethod";

function ease_linearity(factor: number, from = 0, to = 1): number {
  return from + (to - from) * factor;
}
ease_linearity.backward = function (v: number, from = 0, to = 1): number {
  return v - from / (to - from);
};

const exported: IEaseMethod = ease_linearity;
export default exported;
