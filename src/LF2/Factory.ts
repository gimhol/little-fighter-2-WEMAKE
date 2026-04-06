import type { BaseController } from "./controller/BaseController";
import type { IEntityData } from "./defines/IEntityData";
import { Ditto } from "./ditto/Instance";
import type { Entity } from "./entity/Entity";
import type { States } from "./state/States";
import type { UIComponent } from "./ui/component/UIComponent";
import type { IComponentInfo } from "./ui/IComponentInfo";
import type { UINode } from "./ui/UINode";
import type { World } from "./World";

export interface IEntityCreators {
  (world: World, data: IEntityData, states?: States): Entity | undefined
}
export interface ICtrlCreator {
  (player_id: string, entity: Entity): BaseController | undefined
}
export type Key = string | number | symbol

export class Factory {
  static readonly TAG = `Factory`;
  readonly graves_maps = new Map<Key, Entity[]>();
  static readonly entity_creators = new Map<Key, IEntityCreators>();
  static readonly ctrl_creators = new Map<Key, ICtrlCreator>();
  static readonly components = new Map<string, typeof UIComponent>();

  static register_component(Cls: typeof UIComponent<any, any>): void {
    const names = [Cls.TAG].concat()
    if (Cls.ALIAS) names.push(...Cls.ALIAS)
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      if (this.components.has(name)) {
        Ditto.warn(`[${Factory.TAG}::register_component] name already exists, ${name}`)
        debugger;
      }
      this.components.set(name, Cls);
    }
  }
  static register_entity(type: Key, creator: IEntityCreators): void {
    if (Factory.entity_creators.has(type))
      Ditto.warn(`[${Factory.TAG}::register_entity] type already exists, ${type.toString()}`)
    Factory.entity_creators.set(type, creator);
  }
  static register_ctrl(oid: Key, creator: ICtrlCreator): void {
    if (Factory.ctrl_creators.has(oid))
      Ditto.warn(`[${Factory.TAG}::register_ctrl] oid already exists, ${oid.toString()}`)
    Factory.ctrl_creators.set(oid, creator);
  }
  recycle_entity(e: Entity): this {
    let graves = this.graves_maps.get(e.data.type);
    if (!graves) this.graves_maps.set(e.data.type, graves = []);
    graves.push(e);
    return this;
  }
  acquire_entity(type: Key): Entity | undefined {
    return this.graves_maps.get(type)?.pop()
  }
  create_entity(...args: Parameters<IEntityCreators>): Entity | undefined {
    return Factory.entity_creators.get(args[1].type)?.(...args);
  }
  create_ctrl(oid: Key, ...args: Parameters<ICtrlCreator>): BaseController | undefined {
    return Factory.ctrl_creators.get(oid)?.(...args);
  }
  create_components(layout: UINode, components: IComponentInfo[]): UIComponent[] {
    if (!components.length) return [];

    const ret: UIComponent[] = [];
    for (let idx = 0; idx < components.length; idx++) {
      const info = components[idx];
      const cls = Factory.components.get(info.name);
      if (!cls) {
        Ditto.warn(`[${Factory.TAG}::create_components] Component not found! expression: ${info.name}`);
        continue;
      }
      const { name, args = [], enabled = true, id = '', properties = {}, weight = 0 } = info;
      const component = new cls(layout, name, { name, args, enabled, id, properties, weight }, args)
      component.init?.()
      component.set_enabled(enabled);
      component.id = id || `${name}_${idx}`
      ret.push(component);
    }
    return ret;
  }
}
