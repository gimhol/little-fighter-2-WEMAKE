import { Ditto } from "../../ditto";
import { is_str } from "../../utils/type_check";
import { IUIInfo } from "../IUIInfo.dat";
import type { UINode } from "../UINode";
import { parse_call_func_expression } from "../utils/parse_call_func_expression";
import { ALL_COMPONENTS } from "./_COMPONENTS";
import { IUICompnentCallbacks } from "./IUICompnentCallbacks";
import { UIComponent } from "./UIComponent";
class ComponentFactory {
  static inst = new ComponentFactory();
  static readonly TAG = `ComponentFactory`;
  private _component_map = new Map<string, typeof UIComponent<IUICompnentCallbacks>>(ALL_COMPONENTS);

  register(key: string, Cls: typeof UIComponent) {
    if (this._component_map.has(key))
      Ditto.warn(`[${ComponentFactory.TAG}::register] key already exists, ${key}`)
    this._component_map.set(key, Cls);
  }

  create(layout: UINode, components: IUIInfo["component"]): UIComponent[] {
    if (!components) return [];
    if (!Array.isArray(components)) components = [components]
    if (!components.length) return [];

    const ret: UIComponent[] = [];
    for (let idx = 0; idx < components.length; idx++) {
      const raw = components[idx];
      const info = is_str(raw) ? parse_call_func_expression(raw) : raw
      if (!info) {
        Ditto.warn(`[${ComponentFactory.TAG}::create] expression not correct! expression: ${raw}`);
        continue;
      }
      const cls = this._component_map.get(info.name);
      if (!cls) {
        Ditto.warn(`[${ComponentFactory.TAG}::create] Component not found! expression: ${raw}`);
        continue;
      }
      const { name, args = [], enabled = true, id = '', properties = {} } = info;
      const component = new cls(layout, name, { name, args, enabled, id, properties })
      component.init(...args)
      component.set_enabled(enabled);
      component.id = id || `${name}_${idx}`
      ret.push(component);
    }
    return ret;
  }

}
export default ComponentFactory.inst;
