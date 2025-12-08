import type { IEntityData, IFrameInfo, ITexturePieceInfo, TFace } from "@/LF2/defines";
import { Builtin_FrameId, StateEnum } from "@/LF2/defines";
import type { Entity, TData } from "@/LF2/entity/Entity";
import { LF2 } from "@/LF2/LF2";
import { clamp, floor, PI } from "@/LF2/utils";
import * as T from "../_t";
import type { ImageMgr } from "../ImageMgr";
import type { RImageInfo } from "../RImageInfo";
import { white_texture } from "./white_texture";
import type { WorldRenderer } from "./WorldRenderer";
function get_img_map(lf2: LF2, data: TData): Map<string, RImageInfo> {
  const ret = new Map<string, RImageInfo>();
  const { base: { files } } = data;
  const images = lf2.images as ImageMgr
  for (const key of Object.keys(files)) {
    const img = images.find_by_pic_info(files[key]);
    if (!img) continue;
    ret.set(key, img.clone());
  }
  return ret;
}
const BODY_GEOMETRY = new T.PlaneGeometry(1, 1).translate(0.5, -0.5, 0);
const BLOOD_GEOMETRY = new T.PlaneGeometry(1, 3).translate(0, -1.25, 0);
const BLOOD_MESH_MATERIAL = new T.MeshBasicMaterial({
  map: white_texture(),
  color: new T.Color(1, 0, 0),
  transparent: true,
})
const EMPTY_PIECE: ITexturePieceInfo = {
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
  readonly world_renderer: WorldRenderer;

  protected images!: Map<string, RImageInfo>;
  entity!: Entity;
  protected entity_mesh!: T.Mesh<T.BufferGeometry, T.MeshBasicMaterial>;
  protected blood_mesh!: T.Mesh<T.BufferGeometry, T.MeshBasicMaterial>;
  protected variants = new Map<string, string[]>();
  protected shaking: number = 0;
  protected shaking_time: number = 0;
  protected extra_shaking_time: number = 0;
  protected _data?: IEntityData;

  protected _tex?: ITexturePieceInfo
  protected _frame?: IFrameInfo;
  protected _facing?: TFace;
  protected _x?: number;
  protected _y?: number;
  protected _z?: number;

  constructor(entity: Entity) {
    this.world_renderer = entity.world.renderer as WorldRenderer;
    this.reset(entity)
  }

  reset(entity: Entity) {
    this.entity = entity
    this._tex = void 0;
    this._frame = void 0;
    this._facing = void 0;
    this._x = void 0;
    this._y = void 0;
    this._z = void 0;
    this.shaking = 0;
    this.shaking_time = 0;
    this.extra_shaking_time = 0;
    const { lf2, data } = entity;
    this.variants.clear();
    for (const k in data.base.files) {
      if (data.base.files[k].variants)
        this.variants.set(k, [k, ...data.base.files[k].variants]);
      else this.variants.set(k, [k]);
    }
    this._data = entity.data;
    this.images = get_img_map(lf2, entity.data);
    const first_txt = this.images.get("0")?.pic?.texture;
    const mesh = this.entity_mesh = this.entity_mesh || new T.Mesh(
      BODY_GEOMETRY,
      new T.MeshBasicMaterial({
        map: first_txt,
        transparent: true,
      }),
    )

    if (first_txt) first_txt.onUpdate = () => mesh.material.needsUpdate = true;
    mesh.visible = false;
    mesh.name = "Entity:" + data.id;
    if (typeof data.base.depth_test === "boolean") 
      mesh.material.depthTest = data.base.depth_test;
    if (typeof data.base.depth_write === "boolean") 
      mesh.material.depthWrite = data.base.depth_write;
    if (typeof data.base.render_order === "number") 
      mesh.renderOrder = data.base.render_order;

    this.blood_mesh = new T.Mesh(BLOOD_GEOMETRY, BLOOD_MESH_MATERIAL)
    this.blood_mesh.clone()
  }

  on_mount() {
    this.reset(this.entity);
    this.world_renderer.scene.inner.add(
      this.entity_mesh,
      this.blood_mesh
    );
  }

  on_unmount(): void {
    this.entity_mesh.removeFromParent();
    this.blood_mesh.removeFromParent();
  }

  apply_tex(entity: Entity, info: ITexturePieceInfo | undefined) {
    const { images, entity_mesh } = this
    if (info) {
      const { x, y, w, h, tex, pixel_w, pixel_h } = info;
      const real_tex = this.variants.get(tex)?.at(entity.variant) ?? tex;
      const img = images.get(real_tex);
      if (img?.pic) {
        img.pic.texture.offset.set(x, y);
        img.pic.texture.repeat.set(w, h);
        const { material: m } = entity_mesh;
        if (img.pic.texture !== m.map) {
          m.map = img.pic.texture;
          m.needsUpdate = true;
        }
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
    let x = floor(entity.position.x)
    let y = floor(entity.position.y)
    let z = floor(entity.position.z)
    if (
      this._x !== x ||
      this._y !== y ||
      this._z !== z ||
      this._frame !== frame ||
      this._facing !== facing
    ) {
      this._x = x;
      this._y = y;
      this._z = z;
      this._frame = frame;
      this._facing = facing;
      if (entity.data !== this._data)
        this.reset(entity);
      const tex = frame.pic?.[facing]
      if (this._tex !== tex)
        this.apply_tex(entity, this._tex = tex)
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
        this.blood_mesh.visible = is_b_v && entity_mesh.visible;
      } else {
        this.blood_mesh.position.set(ex, ey, ez)
      }
    }
    const is_visible = !entity.invisible;
    const is_blinking = !!entity.blinking;
    entity_mesh.visible = is_visible;
    if (is_blinking && is_visible) {
      entity_mesh.visible = 0 === Math.floor(entity.blinking / 4) % 2;
    }


    const { shaking } = entity
    if (shaking != this.shaking) {
      if (!shaking) this.extra_shaking_time = EXTRA_SHAKING_TIME;
      this.shaking = shaking;
    }

    if (this.shaking || this.extra_shaking_time > 0) {
      this.shaking_time += dt
      const f = (floor(this.shaking_time / 32) % 2) || -1
      entity_mesh.position.x += facing * f;
      this.blood_mesh.position.x += facing * f;
      if (!shaking) this.extra_shaking_time -= dt
    } else {
      this.shaking_time = 0;
    }
  }
}
