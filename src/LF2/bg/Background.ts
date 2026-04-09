import type { World } from "../World";
import type { IBgData, IBgLayerInfo } from "../defines";
import { Layer } from "./Layer";

export class Background {
  readonly data: Readonly<IBgData>;
  private _layers: Layer[] = [];
  get name(): string {
    return this.data.base.name
  }
  get id(): string {
    return this.data.id;
  }
  get left(): number {
    return this.data.base.left;
  }
  get right(): number {
    return this.data.base.right;
  }
  get near(): number {
    return this.data.base.near;
  }
  get far(): number {
    return this.data.base.far;
  }
  get layers(): ReadonlyArray<Layer> {
    return this._layers;
  }
  readonly width: number;
  readonly depth: number;

  readonly middle: { x: number; z: number };
  readonly world: World;
  private _update_times = 0;

  constructor(world: World, data: Readonly<IBgData>) {
    this.data = data;
    this.world = world;

    this.width = this.data.base.right - this.data.base.left;
    this.depth = this.data.base.near - this.data.base.far;
    this.middle = {
      x: (this.data.base.right + this.data.base.left) / 2,
      z: (this.data.base.far + this.data.base.near) / 2,
    };
    for (const info of data.layers)
      this.add_layer(info);
  }

  private add_layer(info: IBgLayerInfo) {
    let { x, loop = 0 } = info;
    if (loop <= 0) {
      this._layers.push(new Layer(this, info))
      return;
    } else {
      const right = this.width + loop;
      for (x -= loop; x < right; x += loop) {
        this._layers.push(new Layer(this, { ...info, x }));
      }
    }
  }

  update() {
    this._update_times++;
    for (const layer of this._layers)
      layer.update(this._update_times);
  }

  dispose() {
    for (const layer of this._layers)
      layer.dispose()
    this._layers.length = 0
  }

}

