import type { Layer } from "@/LF2/bg/Layer";
import * as T from "../_t";
import type { BgRender } from "./BgRender";
import { get_static_plane_geometry } from "./GeometryKeeper";
import { get_bg_layer_material } from "./MaterialKeeper";


export class BgLayerRender {
  readonly mesh: T.Mesh;
  readonly layer: Layer;
  readonly bg_render: BgRender;
  protected offsetX: number = 0;
  protected offsetY: number = 0;
  constructor(bg_render: BgRender, layer: Layer) {
    this.layer = layer;
    this.bg_render = bg_render
    const { info } = layer;
    const { x, y, z, file, id, name } = info;
    const pic = file ? this.layer.bg.world.lf2.images.find(file)?.pic : null
    const w = pic?.w ?? info.w ?? info.width;
    const h = pic?.h ?? info.h ?? info.height;
    this.mesh = new T.Mesh(
      get_static_plane_geometry(w, h, w / 2, -h / 2),
      get_bg_layer_material(info, layer.bg.world.lf2)
    );
    this.mesh.name = `bg layer ${name ?? id ?? 'unnamed'}`;
    this.mesh.position.set(x, y, z);
    this.offsetX = 0;
    this.offsetY = 0;
  }

  render(dt: number): void {
    const {
      visible,
      info: { absolute, offsetAnimX, offsetAnimY }
    } = this.layer;
    this.mesh.visible = visible;
    if (offsetAnimX !== void 0) this.offsetX += (dt / 1000) * offsetAnimX;
    if (offsetAnimY !== void 0) this.offsetY += (dt / 1000) * offsetAnimY;
    if (absolute) return;
    const { bg, info: { x, width: layer_width, } } = this.layer;
    const { world } = bg;
    const { screen_w } = world;
    const { width: bg_width } = world;
    const cam_x = this.bg_render.world_renderer.camera.position.x;
    const _x = bg_width > screen_w ?
      x + (bg_width - layer_width) * cam_x / (bg_width - screen_w) :
      x + (bg_width - layer_width) * cam_x
    this.mesh.position.x = _x;
  }
}