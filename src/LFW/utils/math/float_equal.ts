import { abs } from "./base";
import { round_float } from "./round_float";

export function float_equal(x: number, y: number): boolean {
  return round_float(abs(x - y)) < 0.0001;
}
export default float_equal