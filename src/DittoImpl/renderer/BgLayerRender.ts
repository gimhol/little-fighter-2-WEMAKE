import type Layer from "@/LF2/bg/Layer";
import * as T from "../_t";
import { get_geometry } from "./GeometryKeeper";
import { get_bg_layer_material, MaterialKeeper } from "./MaterialKeeper";


export class BgLayerRender {
  readonly mesh: T.Mesh;
  readonly layer: Layer;

  constructor(layer: Layer) {
    this.layer = layer;
    const { info } = layer;
    const { x, y, z, file } = info;
    const pic = file ? this.layer.bg.world.lf2.images.find(file)?.pic : null
    const w = pic?.w ?? info.width;
    const h = pic?.h ?? info.height;
    this.mesh = new T.Mesh(
      get_geometry(w, h, w / 2, -h / 2),
      get_bg_layer_material(info, layer.bg.world.lf2)
    );
    this.mesh.name = "bg layer";
    this.mesh.position.set(x, y, z);
  }

  render() {
    const { visible, info: { x, absolute, width }, bg } = this.layer;
    this.mesh.visible = visible;
    const cam_x = bg.world.renderer.cam_x;
    const _x = absolute ?
      x + cam_x :
      bg.width > bg.world.screen_w ?
        x + (bg.width - width) * cam_x / (bg.width - bg.world.screen_w) :
        x + (bg.width - width) * cam_x

    this.mesh.position.x = _x;
  }

  release(): void {

  }
}