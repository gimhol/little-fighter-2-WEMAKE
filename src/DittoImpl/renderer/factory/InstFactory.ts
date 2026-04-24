export type Kind = string | number | symbol;
export interface IInstCreator<C> {
  kind: Kind,
  cls: new (...args: any) => C,
  create(): C;
  reset(c: C): void;
}
export abstract class InstFactory<T> {
  readonly abstract TAG: string;
  readonly graves_maps = new Map<Kind, T[]>();
  abstract get_kind(inst: T): Kind;
  abstract set_kind(inst: T, kind: Kind): void;
  readonly creators = new Map<Kind, IInstCreator<T>>();
  register(creator: IInstCreator<T>): void {
    this.creators.set(creator.kind, creator);
  }
  get<C extends T = T>(kind: Kind, cls: new (...args: any) => C, handler?: (c: C) => void): C {
    const { TAG } = this;
    const creator = this.creators.get(kind);
    if (!creator)
      throw new Error(`[${TAG}::get] failed! invalid kind ${kind.toString()}`);
    if (cls !== creator.cls)
      throw new Error(`[${TAG}::get] failed! cls incorrect ${kind.toString()}`);
    const graves = this.graves_maps.get(kind);
    const ret: C = (graves?.pop() ?? creator.create()) as C;
    if (!(ret instanceof creator.cls))
      throw new Error(`[${TAG}::get] failed! cls incorrect ${kind.toString()}`);
    creator.reset(ret);
    this.set_kind(ret, kind);
    handler?.(ret);
    return ret;
  }
  recycle(inst: T): void {
    const { TAG } = this;
    const kind = this.get_kind(inst);
    if (!kind) throw new Error(`[${TAG}::recycle] failed! invalid kind ${kind.toString()}`);
    let graves = this.graves_maps.get(kind);
    if (!graves) this.graves_maps.set(kind, [inst]);
    else graves.push(inst);
  }
}
