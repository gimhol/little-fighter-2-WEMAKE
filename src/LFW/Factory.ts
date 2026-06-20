import { Graves } from "./base/Graves";
import type { Buff } from "./buff/Buff";
import type { BaseController } from "./controller/BaseController";
import type { IEntityData } from "./defines/IEntityData";
import { Ditto } from "./ditto/Instance";
import type { Entity } from "./entity/Entity";
import type { LFW } from "./LFW";
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
export interface IBuffCreator {
  readonly KIND: string | number;
  new(...args: ConstructorParameters<typeof Buff>): Buff;
}
export type Key = string | number | symbol

export class Factory {
  static readonly TAG = `Factory`;
  readonly graves_maps = new Map<Key, Graves<Entity>>();
  static readonly entity_creators = new Map<Key, IEntityCreators>();
  static readonly ctrl_creators = new Map<Key, ICtrlCreator>();
  static readonly buff_creators = new Map<Key, IBuffCreator>();
  static readonly components = new Map<string, typeof UIComponent>();
  protected static readonly _usedALIAS = new Set<string[]>()
  static register_component(Cls: typeof UIComponent<any, any>): void {
    const names = Cls.TAGS
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
  static register_buff(creator: IBuffCreator): void {
    const { KIND } = creator;
    if (Factory.buff_creators.has(KIND))
      Ditto.warn(`[${Factory.TAG}::register_buff] kind already exists, ${KIND.toString()}`)
    Factory.buff_creators.set(KIND, creator);
  }
  create_buff(kind: Key, lfw: LFW, id: string): Buff | undefined {
    const B = Factory.buff_creators.get(kind);
    if (!B) return void 0;
    const ret = new B(lfw, id, B.KIND);
    ret.init();
    return ret;
  }
  recycle_entity(e: Entity): this {
    let graves = this.graves_maps.get(e.data.type);
    if (!graves) this.graves_maps.set(e.data.type, graves = new Graves());
    graves.add(e);
    return this;
  }
  acquire_entity(type: Key): Entity | undefined {
    return this.graves_maps.get(type)?.take()
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

      const clz = Factory.components.get(info.cls);
      if (!clz) {
        Ditto.warn(`[${Factory.TAG}::create_components] Component not found! cls: ${info.cls}`, info);
        continue;
      }
      const id = info.id ?? `${info.cls}_${idx}`
      const name = info.name ?? id
      const rinfo: Required<IComponentInfo> = {
        id: id,
        name: name,
        cls: info.cls,
        args: info.args || [],
        enabled: info.enabled ?? true,
        properties: info.properties || {},
        props: info.props || {},
        weight: info.weight ?? 0
      }
      const component = new clz(layout, rinfo.name, rinfo)
      component.init?.()
      ret.push(component);
    }
    return ret;
  }
}
