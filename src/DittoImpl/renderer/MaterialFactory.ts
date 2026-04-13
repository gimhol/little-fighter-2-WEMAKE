import type { Material } from "../_t";

type Key = string | number | symbol;
export enum MaterialKind {
  Invalid = 0,
  Outline,
}
export interface IMaterialCreator<C extends Material = Material> {
  cls: new (...args: any) => C,
  create(): C;
  reset(c: C): void;
}
export class MaterialFactory {
  static readonly TAG = 'MaterialFactory'
  static readonly graves_maps = new Map<Key, Material[]>();
  static creators = new Map<Key, IMaterialCreator>();
  static register(kind: Key, creator: IMaterialCreator) {
    this.creators.set(kind, creator);
  }
  static get<C extends Material = Material>(kind: Key, cls: new (...args: any) => C, handler?: (c: C) => void): C {
    const creator = this.creators.get(kind)
    if (!creator)
      throw new Error(`[${MaterialFactory.TAG}::get] failed! invalid kind ${kind.toString()}`);
    if (cls !== creator.cls)
      throw new Error(`[${MaterialFactory.TAG}::get] failed! cls incorrect ${kind.toString()}`);
    const graves = this.graves_maps.get(kind)
    const ret: C = (graves?.pop() ?? creator.create()) as C;
    if (!(ret instanceof creator.cls))
      throw new Error(`[${MaterialFactory.TAG}::get] failed! cls incorrect ${kind.toString()}`);
    creator.reset(ret);
    ret.userData.kind = kind;
    handler?.(ret)
    return ret;
  }
  static recycle(m: Material): void {
    const { kind } = m.userData;
    if (!kind) throw new Error(`[${MaterialFactory.TAG}::recycle] failed! invalid kind ${kind.toString()}`)
    let graves = this.graves_maps.get(kind);
    if (!graves) this.graves_maps.set(kind, [m]);
    else graves.push(kind);
  }
}
