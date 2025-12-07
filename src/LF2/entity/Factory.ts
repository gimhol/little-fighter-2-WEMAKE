import type { BaseController } from "../controller/BaseController";
import { EntityEnum } from "../defines/EntityEnum";
import type { Entity } from "./Entity";

export interface ICreator<C, T extends new (...args: any[]) => C> {
  (...args: ConstructorParameters<T>): C;
}

export interface EntityCreators {
  [EntityEnum.Entity]: ICreator<Entity, typeof Entity>;
  [EntityEnum.Ball]: ICreator<Entity, typeof Entity>;
  [EntityEnum.Fighter]: ICreator<Entity, typeof Entity>;
  [EntityEnum.Weapon]: ICreator<Entity, typeof Entity>;
}

export type ControllerCreator = ICreator<BaseController, typeof BaseController>;
export type ControllerCreators = {
  [x in string]?: ControllerCreator;
};

let _factory_inst: Factory | undefined = void 0;
let _entity_creators: Partial<EntityCreators> = {};
let _ctrl_creators: ControllerCreators = {};
export class Factory {
  protected graves_maps = new Map<string | number, Entity[]>();
  release(...es: Entity[]): this {
    // if (!es.length)
    //   return this;
    // for (const e of es) {
    //   let graves = this.graves_maps.get(e.data.type);
    //   if (!graves) this.graves_maps.set(e.data.type, graves = []);
    //   graves.push(e);
    // }
    return this;
  }
  acquire(type: string | number): Entity | null {
    // const graves = this.graves_maps.get(type);
    // if (graves?.length) return graves.pop()!
    return null
  }
  set_entity_creator<K extends keyof EntityCreators>(
    k: K,
    creator: EntityCreators[K],
  ) {
    _entity_creators[k] = creator;
  }
  get_entity_creator(type: string | number): ICreator<Entity, typeof Entity> | undefined;
  get_entity_creator<K extends keyof EntityCreators>(
    type: K,
  ): EntityCreators[K] | undefined;
  get_entity_creator<K extends keyof EntityCreators>(
    type: K,
  ): EntityCreators[K] | undefined {

    return _entity_creators[type];
  }
  get_ctrl(id: string, ...args: Parameters<ControllerCreator>): BaseController | undefined {
    return _ctrl_creators[id]?.(...args);
  }
  set_ctrl_creator(id: string, creator: ControllerCreator) {
    return (_ctrl_creators[id] = creator);
  }
  static get inst(): Factory {
    if (!_factory_inst) _factory_inst = new Factory();
    return _factory_inst;
  }
}
