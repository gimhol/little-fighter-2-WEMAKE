import type { LF2 } from "../../LF2/LF2";
import * as T from "../_t";
import { get_bar_geo, get_color_material } from "./EntityInfoRender";

export class Bar {
  readonly mesh: T.Mesh;
  protected _max: number = 1;
  protected _val: number = 1;

  set max(v: number) {
    this._max = v;
    this.mesh.scale.x = (this._max ? this._val / this._max : 0);
  }
  set val(v: number) {
    this._val = Math.max(0, v);
    this.mesh.scale.x = (this._max ? this._val / this._max : 0);
  }
  set color(color: string) {
    const m = get_color_material(color);
    this.mesh.material = m;
    m.needsUpdate = true;

  }
  constructor(
    lf2: LF2,
    color: T.ColorRepresentation,
    w: number,
    h: number,
    ax: number,
    ay: number
  ) {
    this.mesh = new T.Mesh(
      get_bar_geo(w, h, ax, ay),
      get_color_material(color),
    );
  }

  set(val: number, max: number) {
    this._max = max;
    this._val = val;
    this.mesh.scale.x = this._max ? this._val / this._max : 0;
  }
}
