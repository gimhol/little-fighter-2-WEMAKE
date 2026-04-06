import { IClazz } from "@/LF2/defines";
import { isClass } from "./isClass";
import { UIComponent } from "../component/UIComponent";

export function isUIComponentClass(target: unknown): target is IClazz<UIComponent> {
  return isClass(target, UIComponent);
}


