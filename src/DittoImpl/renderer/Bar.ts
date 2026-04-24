import type { LF2 } from "@/LF2/LF2";
import * as T from "../_t";
import { get_geometry } from "./GeometryKeeper";
import { MaterialFactory, MaterialKind } from "./factory/MaterialFactory";

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
    this.mesh.material = MaterialFactory.get(
      MaterialKind.Color, T.MeshBasicMaterial,
      m => m.color = new T.Color(color)
    )
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
      get_geometry(w, h, ax * w, ay * h),
      MaterialFactory.get(
        MaterialKind.Color, T.MeshBasicMaterial,
        m => m.color = new T.Color(color)
      )
    );
  }

  set(val: number, max: number) {
    this._max = max;
    this._val = val;
    this.mesh.scale.x = this._max ? this._val / this._max : 0;
  }
}
