import type { IBounding } from "../defines";
import { max, min } from "./math/base";

export function cross_bounding(r0: IBounding, r1: IBounding): IBounding {
  const ret = {
    left: max(r0.left, r1.left),
    right: min(r0.right, r1.right),
    bottom: max(r0.bottom, r1.bottom),
    top: min(r0.top, r1.top),
    far: max(r0.far, r1.far),
    near: min(r0.near, r1.near),
  }
  return ret;
}
