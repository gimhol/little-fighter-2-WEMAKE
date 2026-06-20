import { clamp, max } from "@/LFW";
import type { LFW } from "@/LFW/LFW";
import * as T from "../_t";
import { MeshBasicMaterial } from "../_t";
import { get_static_plane_geometry } from "./GeometryKeeper";
import { MaterialFactory, MaterialKind } from "./factory/MaterialFactory";

export class Bar {
  readonly mesh: T.Mesh;
  protected _max: number = 1;
  protected _val: number = 1;

  set max(v: number) {
    this.set(this._val, v);
  }
  set val(v: number) {
    this.set(v, this._max);
  }
  set color(color: string) {
    const m = MaterialFactory.get(MaterialKind.Color, MeshBasicMaterial)
    m.color = new T.Color(color)
    this.mesh.material = m
  }
  constructor(
    lfw: LFW,
    color: T.ColorRepresentation,
    w: number,
    h: number,
    ax: number,
    ay: number
  ) {

    const m = MaterialFactory.get(MaterialKind.Color, MeshBasicMaterial)
    m.color = new T.Color(color)
    const g = get_static_plane_geometry(w, h, ax * w, ay * h)
    this.mesh = new T.Mesh(g, m,);
  }

  set(val: number, _max: number) {
    this._max = max(_max, 0);
    this._val = clamp(val, 0, _max);
    if (this._max <= 0) {
      this.mesh.scale.x = 0;
      return
    }
    this.mesh.scale.x = this._val / this._max;
  }
}
