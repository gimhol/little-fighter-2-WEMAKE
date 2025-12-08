export interface IVector3Like {
  x: number;
  y: number;
  z: number;
}
export interface IVector3 extends IVector3Like {
  set(x: number, y: number, z: number): void;
  add(o: IVector3): void;
  copy(o: IVector3Like): void;
  clone(): IVector3;
  normalize(): this;
}
