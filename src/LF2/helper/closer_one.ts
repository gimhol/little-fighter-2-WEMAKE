import { Entity } from "../entity";
import { Unsafe } from "../utils";
import { manhattan_xz } from "./manhattan_xz";

export function closer_one(s: Unsafe<Entity>,
  t1: Unsafe<Entity>,
  t2: Unsafe<Entity>
): Entity | null {
  if (!s) return null;
  if (t1 && t2)
    return manhattan_xz(s, t1) > manhattan_xz(s, t2) ? t2 : t1
  if (t1) return t1;
  if (t2) return t2;
  return null;
}
