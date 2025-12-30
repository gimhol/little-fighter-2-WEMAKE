import { BufferGeometry, PlaneGeometry } from "../_t";
import { Keeper } from "./Keeper";

export const GeometryKeeper = new Keeper<string, BufferGeometry>();
export const get_geometry = (w: number = 1, h: number = 1, tx: number = 0, ty: number = 0, tz: number = 0) =>
  GeometryKeeper.get(`${w}_${h}_${tx}_${ty}_${tz}`, () => new PlaneGeometry(w, h).translate(tx, ty, tz))

