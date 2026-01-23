import { ITransform } from "./ITransform";
import { round_float } from "./utils";

export class Transform implements ITransform {
  protected _x: number = 0;
  protected _y: number = 0;
  protected _z: number = 0;
  protected _d: ITransform = { x: 0, y: 0, z: 0 };
  // 临时写着玩的
  earthquake_level: number = 0;
  // 临时写着玩的
  earthquake: number = 0;
  get d() { return this._d }
  get x() { return this._x }
  get y() { return this._y }
  get z() { return this._z }
  set x(v: number) { this._d.x = this._x = v }
  set y(v: number) { this._d.y = this._y = v }
  set z(v: number) { this._d.z = this._z = v }

  snapshot(): ITransform {
    const { x, y, z } = this
    return { x, y, z }
  }
  update(): void {
    if (this.earthquake)
      this.earthquake--;
    const d = this._d
    if (d) {
      const { x, y, z } = this
      if (d.x !== x) this._x = round_float(x + (d.x - x) * 0.1, 100)
      if (d.y !== y) this._y = round_float(y + (d.y - y) * 0.1, 100)
      if (d.z !== z) this._z = round_float(z + (d.z - z) * 0.1, 100)
    }
  }
  move_to(x: number = this.x, y: number = this.y, z: number = this.z, smooth: boolean = false): void {
    this._d.x = x
    this._d.y = y
    this._d.z = z
    if (!smooth) {
      this._x = x;
      this._y = y;
      this._z = z;
    }
  }
}
