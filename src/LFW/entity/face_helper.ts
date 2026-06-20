import type { TFace } from "../defines";
import type { Entity } from "./Entity";

export function same_face(ref: Entity, target: Entity): TFace {
  return ref.facing === target.facing ? 1 : -1;
}

export function turn_face(f: TFace): TFace;
export function turn_face(f?: TFace): TFace | undefined;
export function turn_face(f?: TFace): TFace | undefined {
  return f === void 0 ? void 0 : f === 1 ? -1 : 1;
}
