import { BufferGeometry, PlaneGeometry } from "../_t";
// import { Keeper } from "./Keeper";
import { INinePatchGeometryParams, NinePatchGeometry } from "./NinePatchGeometry";

export class Keeper<K, V> {
  protected pool = new Map<K, V>();
  get(key: K, f: () => V): V {
    let ret = this.pool.get(key);
    if (!ret) this.pool.set(key, ret = f());
    return ret;
  }
}

export const GeometryKeeper = new Keeper<string, BufferGeometry>();
export interface IGeoOpts {
  tx?: number,
  ty?: number,
  tz?: number,
}
export interface IPlaneGeometryParams {
  w?: number,
  h?: number,
}
export const get_geometry = (w: number = 1, h: number = 1, tx: number = 0, ty: number = 0, tz: number = 0) =>
  GeometryKeeper.get(`pg_${w}_${h}_${tx}_${ty}_${tz}`, () => new PlaneGeometry(w, h).translate(tx, ty, tz))

export const get_plane_geometry = (opts: IPlaneGeometryParams & IGeoOpts) => {
  const { tx = 0, ty = 0, tz = 0, w = 1, h = 1 } = opts
  const key = `npg_` + JSON.stringify(opts)
  return GeometryKeeper.get(key, () => new PlaneGeometry(w, h).translate(tx, ty, tz))
}

export const get_ninepatch_geometry = (opts: INinePatchGeometryParams & IGeoOpts) => {
  const { tx = 0, ty = 0, tz = 0 } = opts
  const key = `npg_` + JSON.stringify(opts)
  return GeometryKeeper.get(key, () => new NinePatchGeometry(opts).translate(tx, ty, tz))
}