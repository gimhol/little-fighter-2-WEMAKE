import { floor_float } from "./floor_float";
export function normalize(n: number, p?: number): 1 | -1 | 0 {
  n = floor_float(n, p)
  if (n > 0) return 1;
  if (n < 0) return -1;
  return 0;
};
