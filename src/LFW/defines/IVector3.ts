import type { IVector3Like } from "./IVector3Like";

export interface IVector3 extends IVector3Like {
  set(x: number, y: number, z: number): void;
  add(o: IVector3Like): this;
  sub(o: IVector3Like): this;
  copy(o: IVector3Like): void;
  clone(): IVector3;
  normalize(): this;
  equals(o: IVector3Like): boolean;
}