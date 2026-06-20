type GlobalCompositeOperation =
  "source-in" | "color" | "color-burn" | "color-dodge" | "copy" | "darken" |
  "destination-atop" | "destination-in" | "destination-out" |
  "destination-over" | "difference" | "exclusion" | "hard-light" | "hue" |
  "lighten" | "lighter" | "luminosity" | "multiply" | "overlay" | "saturation" |
  "screen" | "soft-light" | "source-atop" | "source-out" | "source-over" | "xor"
export interface IImageOp_Color {
  type: "mask";
  packs: { operation: GlobalCompositeOperation, color: string }[]
}
