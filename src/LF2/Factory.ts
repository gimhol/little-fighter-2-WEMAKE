import type { BaseController } from "./controller/BaseController";
import type { IEntityData } from "./defines/IEntityData";
import type { Entity } from "./entity/Entity";
import type { States } from "./state/States";
import type { World } from "./World";


export interface IEntityCreators {
  (world: World, data: IEntityData, states?: States): Entity | undefined
}
export interface ICtrlCreator {
  (player_id: string, entity: Entity): BaseController | undefined
}
export type Key = string | number | symbol

export class Factory {
  protected graves_maps = new Map<Key, Entity[]>();
  protected static entity_creators = new Map<Key, IEntityCreators>();
  protected static ctrl_creators = new Map<Key, ICtrlCreator>();
  static regist_entity(type: Key, creator: IEntityCreators): void {
    Factory.entity_creators.set(type, creator);
  }
  static regist_ctrl(oid: Key, creator: ICtrlCreator): void {
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
}
