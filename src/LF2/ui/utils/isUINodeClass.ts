import { IClazz } from "@/LF2/defines";
import { UINode, isClass, UIComponent } from "..";


export function isUINodeClass(target: unknown): target is IClazz<UINode> {
  return isClass(target, UIComponent);
}
