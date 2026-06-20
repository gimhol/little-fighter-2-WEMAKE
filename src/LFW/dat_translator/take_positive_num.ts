import { is_positive } from "../utils";
import { take } from "./take";


export function take_positive_num(
  any: any,
  key: string | number | symbol,
  fn?: (n: number) => number
): number | undefined {
  const v = Number(take(any, key));
  return !is_positive(v) ? void 0 : fn ? fn(v) : v;
}
