import type { IEntityData, IPicture, ITexturePieceInfo } from "../../LF2/defines";
import { Builtin_FrameId, StateEnum } from "../../LF2/defines";
import type { Entity } from "../../LF2/entity/Entity";
import create_pictures from "../../LF2/loader/create_pictures";
import { white_texture } from "./white_texture";
import { clamp, floor, PI } from "../../LF2/utils";
import * as T from "../_t";
import type { WorldRenderer } from "./WorldRenderer";
export const EMPTY_PIECE: ITexturePieceInfo = {
  tex: "0",
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  pixel_h: 0,
  pixel_w: 0,
};
const EXTRA_SHAKING_TIME = 100;
const r_vec3 = new T.Vector3(0, 0, -1);
export class EntityRender {
  readonly renderer_type: string = "Entity";
  protected pictures!: Map<string, IPicture<T.Texture>>;
  entity!: Entity;
  protected entity_mesh!: T.Mesh;
  protected blood_mesh!: T.Mesh;
  protected entity_material!: T.MeshBasicMaterial;
  protected variants = new Map<string, string[]>();
  protected piece: ITexturePieceInfo = EMPTY_PIECE;
  protected _shaking: number = 0;
  protected _shaking_time: number = 0;
  protected _extra_shaking_time: number = 0;
  protected _prev_data?: IEntityData;
  protected world_renderer: WorldRenderer;

  constructor(entity: Entity) {
    this.set_entity(entity);
    this.world_renderer = entity.world.renderer as WorldRenderer;
  }

  set_entity(entity: Entity): EntityRender {
    const { world, lf2, data } = (this.entity = entity);
    this.variants.clear();
    for (const k in data.base.files) {
      if (data.base.files[k].variants)
        this.variants.set(k, [k, ...data.base.files[k].variants]);
      else this.variants.set(k, [k]);
    }
    this._prev_data = entity.data;
    this.pictures = create_pictures(lf2, entity.data);
    const first_text = this.pictures.get("0")?.texture;
    const inner = (this.entity_mesh = this.entity_mesh || new T.Mesh(
      new T.PlaneGeometry(1, 1).translate(0.5, -0.5, 0),
      (this.entity_material = new T.MeshBasicMaterial({
        map: first_text,
        transparent: true,
      })),
    ));

    if (first_text) first_text.onUpdate = () => {
      const { material: m } = inner;
      if (!Array.isArray(m)) m.needsUpdate = true;
      else for (const mm of m) mm.needsUpdate = true;
    }

    this.entity_mesh.visible = false;
    this.entity_mesh.name = "Entity:" + data.id;
    if (typeof data.base.depth_test === "boolean") {
      const { material: m } = inner;
      if (!Array.isArray(m)) m.depthTest = data.base.depth_test;
      else for (const mm of m) mm.depthTest = data.base.depth_test;
    }

    if (typeof data.base.depth_write === "boolean") {
      const { material: m } = inner;
      if (!Array.isArray(m)) m.depthWrite = data.base.depth_write;
      else for (const mm of m) mm.depthWrite = data.base.depth_write;
    }
    if (typeof data.base.render_order === "number") {
      this.entity_mesh.renderOrder = data.base.render_order;
    }

    this.blood_mesh = new T.Mesh(
      new T.PlaneGeometry(1, 3).translate(0, -1.25, 0),
      new T.MeshBasicMaterial({
        map: white_texture(),
        color: new T.Color(1, 0, 0),
        transparent: true,
      }),
    )

    return this;
  }
  get visible(): boolean {
    return this.entity_mesh.visible;
  }
  set visible(v: boolean) {
    this.entity_mesh.visible = v;
  }
  on_mount() {
    this.world_renderer.scene.inner.add(
      this.entity_mesh,
      this.blood_mesh
    );
  }
  on_unmount(): void {
    this.entity_mesh.removeFromParent();
    this.blood_mesh.removeFromParent()
    if (this.pictures)
      for (const [, pic] of this.pictures) pic.texture.dispose();
  }
  private _prev_tex?: ITexturePieceInfo

  apply_tex(entity: Entity, info: ITexturePieceInfo | undefined) {
    const { pictures, entity_material, entity_mesh } = this
    if (info) {
      const { x, y, w, h, tex, pixel_w, pixel_h } = info;
      const real_tex = this.variants.get(tex)?.at(entity.variant) ?? tex;
      const pic = pictures.get(real_tex);
      if (pic) {
        pic.texture.offset.set(x, y);
        pic.texture.repeat.set(w, h);
        if (pic.texture !== entity_material.map) {
          entity_material.map = pic.texture;
        }
        const { material: m } = entity_mesh;
        if (!Array.isArray(m)) m.needsUpdate = true;
        else for (const mm of m) mm.needsUpdate = true;
      }
      entity_mesh.scale.set(pixel_w, pixel_h, 0);
    } else {
      entity_mesh.scale.set(0, 0, 0);
    }
  }
  render(dt: number) {
    const { entity, entity_mesh } = this;
    if (entity.frame.id === Builtin_FrameId.Gone) return;
    const { frame, facing } = entity;
    let { position: { x, y, z } } = entity;
    if (entity.data !== this._prev_data) {
      this.set_entity(entity);
    }
    const tex = frame.pic?.[facing]
    if (this._prev_tex !== tex) {
      this.apply_tex(entity, this._prev_tex = tex)
    }

    const { centerx, centery, state, bpoint } = frame;
    const offset_x = entity.facing === 1 ? centerx : entity_mesh.scale.x - centerx;

    if (state === StateEnum.Message) {
      let { cam_x } = this.entity.world.renderer;
      let cam_r = cam_x + this.entity.world.screen_w;
      cam_r -= entity_mesh.scale.x - offset_x
      cam_x += offset_x
      x = clamp(x, cam_x, cam_r)
    }
    const ex = Math.round(x - offset_x)
    const ey = Math.round(y - z / 2 + centery)
    const ez = Math.round(z)
    entity_mesh.position.set(ex, ey, ez);

    const is_b_v = !!bpoint && entity.hp < entity.hp_max * 0.33;
    if (bpoint) {
      let { x: bx, y: by, z: bz = 0, r = 0 } = bpoint
      bx = entity.facing === 1 ? bx : entity_mesh.scale.x - bx;
      this.blood_mesh.position.set(ex + bx - entity.facing / 2, ey - by - 0.5, ez + bz);
      this.blood_mesh.setRotationFromAxisAngle(r_vec3, r * PI / 180)
    } else {
      this.blood_mesh.position.set(ex, ey, ez)
    }
    const is_visible = !entity.invisible;
    const is_blinking = !!entity.blinking;
    entity_mesh.visible = is_visible;
    if (is_blinking && is_visible) {
      entity_mesh.visible = 0 === Math.floor(entity.blinking / 4) % 2;
    }

    this.blood_mesh.visible = is_b_v && entity_mesh.visible;

    const { shaking } = entity
    if (shaking != this._shaking) {
      if (!shaking) this._extra_shaking_time = EXTRA_SHAKING_TIME;
      this._shaking = shaking;
    }

    if (this._shaking || this._extra_shaking_time > 0) {
      this._shaking_time += dt
      const f = (floor(this._shaking_time / 32) % 2) || -1
      entity_mesh.position.x += facing * f;
      this.blood_mesh.position.x += facing * f;
      if (!shaking) this._extra_shaking_time -= dt
    } else {
      this._shaking_time = 0;
    }
  }
}
