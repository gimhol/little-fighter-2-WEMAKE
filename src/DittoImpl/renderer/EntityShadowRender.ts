
import { clamp, min, type Entity } from "@/LF2";
import { BufferGeometry, Mesh, MeshBasicMaterial, Vector3 } from "../_t";
import { get_static_plane_geometry } from "./GeometryKeeper";
import { get_static_img_material } from "./MaterialKeeper";
import type { WorldRenderer } from "./WorldRenderer";

export class EntityShadowRender {
  readonly mesh: Mesh<BufferGeometry, MeshBasicMaterial>;
  readonly entity: Entity;
  readonly world_renderer: WorldRenderer;
  protected _w: number = 0;
  protected _h: number = 0;
  protected _img: string = '';
  protected _update_id: number = -1;
  private _p0 = new Vector3()
  private _p1 = new Vector3()
  private _s0 = new Vector3(1, 1, 1)
  private _s1 = new Vector3(1, 1, 1)
  private _o0: number = 0
  private _o1: number = 0
  private _t: number = 0


  get lf2() { return this.entity.lf2 }
  get world() { return this.entity.world }
  get bg() { return this.world.bg }
  get visible() { return this.mesh.visible; }
  set visible(v) { this.mesh.visible = v; }
  constructor(entity: Entity, world_renderer: WorldRenderer) {
    this.entity = entity;
    const { lf2, world } = entity;
    const { base } = world.bg.data
    const { shadow, shadowsize: [sw, sh] } = base;
    this.world_renderer = world_renderer;
    this._h = sh;
    this._w = sw;
    this._img = shadow;
    this.mesh = new Mesh(
      get_static_plane_geometry(sw, sh),
      get_static_img_material(lf2, shadow).clone(),
    );
    this.mesh.visible = false;
    this.mesh.name = EntityShadowRender.name;
    this.mesh.renderOrder = 0;
  }
  on_mount() {
    this.world_renderer.world_node.add(this.mesh);
    this.update_position(true);
    this.update_scale_opacity(true);
  }
  on_unmount() {
    this.mesh.removeFromParent();
  }
  update_position(immidiate: boolean = false): void {
    const { position: { x, z }, ground_y } = this.entity;
    this._p0.copy(this._p1);
    this._p1.x = x
    this._p1.y = ground_y - z / 2
    this._p1.z = z - 550
    if (immidiate) {
      this._p0.copy(this._p1);
      this.mesh.position.copy(this._p1);
    }
  }
  update_scale_opacity(immidiate: boolean = false): void {
    const { position: { y }, ground_y } = this.entity;
    this._s0.copy(this._s1)
    this._s1.x = this._s1.y = 0.5 + 0.5 * clamp(250 - (y - ground_y), 0, 250) / 250
    this._o0 = this._o1;
    this._o1 = 0.3 + 0.7 * clamp(250 - (y - ground_y), 0, 250) / 250
    if (immidiate) {
      this._s0.copy(this._s1)
      this._o0 = this._o1;
      this.mesh.scale.copy(this._s1)
      this.mesh.material.opacity = this._o1;
    }
  }

  render(dt: number) {
    const d = this.world.TU;
    this._t = min(this._t + dt, d);
    const { entity } = this;
    const update_id = entity.lifetime;
    if (update_id !== this._update_id) {
      this._update_id = update_id;
      const { bg, lf2 } = this;
      const { shadowsize: [sw, sh], shadow } = bg.data.base;
      if (sw !== this._w || sh !== this._h) {
        this.mesh.geometry = get_static_plane_geometry(this._w = sw, this._h = sh);
      }
      if (shadow !== this._img) {
        this.mesh.material = get_static_img_material(lf2, this._img = shadow).clone()
      }
      const { frame, invisible } = entity;
      this.update_position();
      this.update_scale_opacity();
      this.mesh.visible = !invisible && !frame.no_shadow;
      this._t = 0;
    }
    if (this.world.sync_render == 0) {
      const f = this._t / d;
      this.mesh.position.lerpVectors(this._p0, this._p1, f);
      this.mesh.scale.lerpVectors(this._s0, this._s1, f);
      this.mesh.material.opacity = this._o0 + (this._o1 - this._o0) * f;
    } else {
      this.mesh.position.copy(this._p1);
      this.mesh.scale.copy(this._s1)
      this.mesh.material.opacity = this._o1;
    }
  }
}
