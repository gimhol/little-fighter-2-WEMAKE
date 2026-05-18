
import { clamp, round, type Entity } from "@/LF2";
import * as T from "../_t";
import { BufferGeometry, Mesh, MeshBasicMaterial } from "../_t";
import { get_geometry } from "./GeometryKeeper";
import { get_img_material } from "./MaterialKeeper";
import { WorldRenderer } from "./WorldRenderer";

export class EntityShadowRender {
  readonly mesh: Mesh<BufferGeometry, MeshBasicMaterial>;
  readonly entity: Entity;
  protected _w: number = 0;
  protected _h: number = 0;
  protected _img: string = '';
  
  get lf2() { return this.entity.lf2 }
  get world() { return this.entity.world }
  get bg() { return this.world.bg }
  get visible() { return this.mesh.visible; }
  set visible(v) { this.mesh.visible = v; }
  constructor(entity: Entity) {
    this.entity = entity;
    const { lf2, world } = entity;
    const { base } = world.bg.data
    const { shadow, shadowsize: [sw, sh] } = base;
    this._h = sh;
    this._w = sw;
    this._img = shadow;
    this.mesh = new T.Mesh(
      get_geometry(sw, sh),
      get_img_material(shadow, lf2),
    );
    this.mesh.visible = false;
    this.mesh.name = EntityShadowRender.name;
    this.mesh.renderOrder = 0;
  }
  on_mount() {
    this.mesh.visible = false;
    (this.entity.world.renderer as WorldRenderer).world_node.add(this.mesh);
  }
  on_unmount() {
    this.mesh.removeFromParent();
  }
  render() {
    const { entity, bg, lf2 } = this;
    const { shadowsize: [sw, sh], shadow } = bg.data.base;
    if (sw !== this._w || sh !== this._h) {
      this._h = sh;
      this._w = sw;
      this.mesh.geometry = get_geometry(sw, sh);
    }
    if (shadow !== this._img) {
      this._img = shadow;
      this.mesh.material = get_img_material(shadow, lf2)
    }
    const {
      frame,
      position: { x, y, z },
      invisible,
      ground_y
    } = entity;
    this.mesh.position.set(
      round(x),
      round(ground_y - z / 2),
      round(z - 550),
    );
    const scale = 0.5 + 0.5 * clamp(250 - (y - ground_y), 0, 250) / 250
    const opacity = 0.3 + 0.7 * clamp(250 - (y - ground_y), 0, 250) / 250
    this.mesh.scale.set(scale, scale, 1)
    this.mesh.material.opacity = opacity;
    this.mesh.visible = !invisible && !frame.no_shadow;
  }
}
