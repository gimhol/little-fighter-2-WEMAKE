import { floor } from "./base";

export function floor_float(n: number, multiplier: number = 1000) {
  return floor(n * multiplier) / multiplier;
}

