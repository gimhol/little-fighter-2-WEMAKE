import { Ditto } from "../../ditto";
import { IComponentInfo } from "../IComponentInfo";
import type { UINode } from "../UINode";
import { ALL_COMPONENTS } from "./_";
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

  create(layout: UINode, components: IComponentInfo[]): UIComponent[] {
    if (!components.length) return [];

    const ret: UIComponent[] = [];
    for (let idx = 0; idx < components.length; idx++) {
      const info = components[idx];
      const cls = this._component_map.get(info.name);
      if (!cls) {
        Ditto.warn(`[${ComponentFactory.TAG}::create] Component not found! expression: ${info.name}`);
        continue;
      }
      const { name, args = [], enabled = true, id = '', properties = {}, weight = 0 } = info;
      const component = new cls(layout, name, { name, args, enabled, id, properties, weight })
      component.init(...args)
      component.set_enabled(enabled);
      component.id = id || `${name}_${idx}`
      ret.push(component);
    }
    return ret;
  }

}
export default ComponentFactory.inst;
