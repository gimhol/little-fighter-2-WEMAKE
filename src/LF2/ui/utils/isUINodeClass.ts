import { IClazz } from "@/LF2/defines";
import { UINode } from "../UINode";
import { isClass } from "./isClass";


export function isUINodeClass(target: unknown): target is IClazz<UINode> {
  return isClass(target, UINode);
}
