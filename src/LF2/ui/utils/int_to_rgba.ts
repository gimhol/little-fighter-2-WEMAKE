import { IRGBA } from "./IRGBA";
export function int_to_rgba(num: number): IRGBA | null {
  if (!Number.isInteger(num) || num < 0) return null;
  const a = ((num >> 24) & 0xff) / 255;
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return { r, g, b, a };
}
