import { IRGBA } from "./IRGBA";

export function hex_to_rgba(hex: string): IRGBA | null {
  hex = hex.trim();
  if (hex.length === 3)
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length === 4)
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  if (hex.length === 6)
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
      a: 1
    };
  if (hex.length === 8)
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
      a: parseInt(hex.substring(6, 8), 16) / 255
    };
  return null;
}
