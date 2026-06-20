import { round_float } from "./round_float";

export function clamp_add(value: number, offset: number, min: number, max: number): number {
  value = round_float(value + offset);
  return value < min ? min : value > max ? max : value;
}
