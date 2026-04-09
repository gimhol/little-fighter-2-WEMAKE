import type { IClazz } from "../../defines";
import { UIComponent } from "../component/UIComponent";
import { isClass } from "./isClass";

export function isUIComponentClass(target: unknown): target is IClazz<UIComponent> {
  return isClass(target, UIComponent);
}


