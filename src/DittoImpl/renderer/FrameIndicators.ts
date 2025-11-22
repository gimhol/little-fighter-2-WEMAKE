import { IFrameInfo } from "../../LF2/defines";
import { IQube } from "../../LF2/defines/IQube";
import { IQubePair } from "../../LF2/defines/IQubePair";
import type { Entity } from "../../LF2/entity/Entity";
import { foreach } from "../../LF2/utils/container_help/foreach";
import * as T from "../_t";
import type { WorldRenderer } from "./WorldRenderer";
const line_geometry = new T.LineGeometry();
const line_vertices = new Float32Array([
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1,
]);
line_geometry.setPositions(line_vertices);

const EMPTY_ARR = [] as const;
const DOT = {
  indicator_info: {
    1: {
      z: 0,
      l: 0,
      x: -1,
      y: -1,
      w: 2,
      h: 2
    },
    [-1]: {
      z: 0,
      l: 0,
      x: -1,
      y: -1,
      w: 2,
      h: 2
    }
  }
}
type Indicatable = { indicator_info?: IQubePair }
export type Indicating = 'frame' | 'bdy' | 'itr' | 'ft' | 'opoint' | 'wpoint' | 'cpoint' | 'bpoint';
export const INDICATINGS: Record<Indicating, number> = {
  frame: 1,
  bdy: 2,
  itr: 4,
  ft: 8,
  opoint: 16,
  wpoint: 32,
  cpoint: 64,
  bpoint: 128,
}
export const INDICATORS_INFO = {
  bdy: {
    color: 0x00ff00, // #00FF00
    linewidth: 3,
  },
  itr: {
    color: 0xff0000, // #FF0000
    linewidth: 3,
  },
  frame: {
    color: 0xffff00, // #FFFF00
    linewidth: 3,
  },
  ft: {
    color: 0x2288FF, // #2288FF
    linewidth: 10,
  },
  opoint: {
    color: 0xFF2288, // #8822FF
    linewidth: 10,
  },
  wpoint: {
    color: 0xFF2288, // #22FF88
    linewidth: 10,
  },
  cpoint: {
    color: 0xFF2288, // #FF8822
    linewidth: 10,
  },
  bpoint: {
    color: 0xFF2288, // #FF2288
    linewidth: 10,
  },
};
const geometry = new T.BufferGeometry();
const vertices = new Float32Array([
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1,
]);
geometry.setAttribute("position", new T.BufferAttribute(vertices, 3));
export class FrameIndicators {
  readonly renderer_type: string = "FrameIndicators";
  protected _entity: Entity;
  protected _indicators_map: Record<Indicating, T.Object3D[]> = {
    frame: [],
    bdy: [],
    itr: [],
    ft: [],
    opoint: [],
    wpoint: [],
    cpoint: [],
    bpoint: []
  };

  private _x: number = 0;
  private _y: number = 0;
  private _z: number = 0;
  private _prev_flags?: number;
  private _prev_frame?: IFrameInfo;
  private _prev_face?: number;

  get scene() {
    return (this._entity.world.renderer as WorldRenderer).scene;
  }
  get frame() {
    return this._entity.frame;
  }
  get face() {
    return this._entity.facing;
  }
  private _flags: number = 0;
  set flags(v: number) {
    if (this._flags === v) return;
    this._flags = v;
    this.render();
  }

  constructor(entity: Entity) {
    this._entity = entity;
  }
  get visible(): boolean {
    throw new Error("Method not implemented.");
  }
  set visible(v: boolean) {
    throw new Error("Method not implemented.");
  }

  protected _new_indicator(k: keyof typeof this._indicators_map, idx: number) {
    const ret = (this._indicators_map[k][idx] = new T.Line2(
      line_geometry,
      new T.LineMaterial(INDICATORS_INFO[k]),
    ));
    this.scene.inner.add(ret);
    return ret;
  }

  protected _del_indicator(k: keyof typeof this._indicators_map, idx: number) {
    const [indicator] = this._indicators_map[k].splice(idx, 1);
    indicator?.removeFromParent();
  }
  show_indicators(name: keyof typeof this._indicators_map) {
    let data: readonly Indicatable[];

    switch (name) {
      case "frame": data = [this.frame]; break;
      case "ft": data = [DOT]; break;
      case "opoint":
      case "bdy":
      case "itr":
        data = this.frame[name] || EMPTY_ARR;
        break;
      case "wpoint":
      case "cpoint":
      case "bpoint":
        data = this.frame[name] ? [this.frame[name]] : EMPTY_ARR;
        break;
      default:
        data = EMPTY_ARR;
        break;
    }
    const data_len = data.length;
    const indicator_len = Math.max(this._indicators_map[name].length, data_len);
    for (let i = 0; i < indicator_len; ++i) {
      if (i >= data_len) {
        this._del_indicator(name, i);
        continue;
      }
      const info = data[i].indicator_info?.[this.face];
      if (!info) {
        this._del_indicator(name, i);
        continue;
      }
      const indicator =
        this._indicators_map[name][i] ?? this._new_indicator(name, i);
      const y = this._y + info.y;
      const x = this._x + info.x;
      indicator.userData.info = info;
      indicator.position.set(x, y, this._z);
      indicator.scale.set(info.w, info.h, 1);
    }
  }

  hide_indicators(k: keyof typeof this._indicators_map) {
    const indicators = this._indicators_map[k]
    if (!indicators.length) return
    this.scene.inner.remove(...indicators);
    indicators.length = 0;
  }

  on_mount(): void { }

  on_unmount() {
    foreach(this._indicators_map, (list) => {
      list.forEach((item) => this.scene.inner.remove(item));
      list.length = 0;
    });
  }
  update_indicators() {
    foreach(this._indicators_map, (indicators) => {
      foreach(indicators, indicator => {
        const info = indicator.userData.info as IQube
        const y = this._y + info.y;
        const x = this._x + info.x;
        indicator.userData.info = info;
        indicator.position.set(x, y, this._z);
        indicator.scale.set(info.w, info.h, 1);
      })
    })
  }

  render() {
    if (this._flags) {
      const { x: game_x, y: game_y, z: game_z } = this._entity.position;
      this._x = game_x;
      this._y = game_y - game_z / 2;
      this._z = game_z;
    }

    if (
      this._flags === this._prev_flags &&
      this._prev_frame === this.frame &&
      this._prev_face === this.face
    ) {
      if (this._flags) this.update_indicators()
      return;
    }

    foreach(INDICATINGS, (n, k) => {
      if (this._flags & n) this.show_indicators(k);
      else this.hide_indicators(k);
    })
    this._prev_flags = this._flags;
    this._prev_frame = this.frame;
    this._prev_face = this.face;
  }
}
