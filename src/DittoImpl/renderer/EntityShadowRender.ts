
import { Background } from "@/LF2/bg/Background";
import type { Entity } from "@/LF2/entity/Entity";
import { clamp, floor } from "@/LF2/utils";
import * as T from "../_t";
import { get_geometry } from "./GeometryKeeper";
import { WorldRenderer } from "./WorldRenderer";
import { get_img_material } from "./MaterialKeeper";

export class EntityShadowRender {
  readonly mesh: T.Mesh<T.BufferGeometry, T.MeshBasicMaterial>;
  readonly entity: Entity;
  get world() { return this.entity.world }
  get lf2() { return this.entity.lf2 }
  bg: Readonly<Background> | undefined = void 0
  get visible() {
    return this.mesh.visible;
  }
  set visible(v) {
    this.mesh.visible = v;
  }
  constructor(entity: Entity) {
    this.entity = entity
    this.mesh = new T.Mesh(
      get_geometry(0, 0),
      get_img_material(),
    );
    this.mesh.name = EntityShadowRender.name;
    this.mesh.renderOrder = 0;
  }

  on_mount() {
    (this.entity.world.renderer as WorldRenderer).scene.inner.add(this.mesh);
  }

  on_unmount() {
    this.mesh.removeFromParent();
  }

  protected _shadow_w: number = 0;
  protected _shadow_h: number = 0;
  protected _shadow_img: string = '';

  render() {
    const { entity } = this;
    const { bg, lf2 } = this.world;
    const [sw, sh] = bg.data.base.shadowsize || [30, 30];
    if (sw !== this._shadow_w || sh !== this._shadow_h) {
      this._shadow_h = sh;
      this._shadow_w = sw;
      this.mesh.geometry = get_geometry(sw, sh);
    }
    const { shadow } = bg.data.base;
    if (shadow !== this._shadow_img) {
      this._shadow_img = shadow;
      this.mesh.material = get_img_material(shadow, lf2).clone()
      this.mesh.material.needsUpdate = true;
    }

    const {
      frame,
      position: { x, z, y },
      invisible,
      ground
    } = entity;
    const gy = ground.get_y(x, z, y)
    this.mesh.position.set(
      floor(x),
      floor(gy - z / 2),
      floor(z - 550),
    );
    const scale = 0.5 + 0.5 * clamp(250 - (y - gy), 0, 250) / 250
    const opacity = 0.3 + 0.7 * clamp(250 - (y - gy), 0, 250) / 250
    this.mesh.scale.set(scale, scale, 1)
    this.mesh.material.opacity = opacity;
    this.mesh.visible = !invisible && !frame.no_shadow;
  }
}

export default EntityShadowRender