import type { Entity, IEntityData, IFrameInfo, IFramePictureInfo, TFace } from "@/LF2";
import { Builtin_FrameId, clamp, floor, LF2, random_in, round, StateEnum, World } from "@/LF2";
import * as T from "../_t";
import type { ImageMgr } from "../ImageMgr/ImageMgr";
import type { RImageInfo } from "../RImageInfo";
import { MaterialFactory, MaterialKind } from "./factory/MaterialFactory";
import { get_geometry } from "./GeometryKeeper";
import { OutlineMaterial } from "./materials/OutlineMaterial";
import { vec001, vec2 } from "./Mess";
import type { WorldRenderer } from "./WorldRenderer";
function get_img_map(lf2: LF2, data: IEntityData): Map<string, RImageInfo> {
  const ret = new Map<string, RImageInfo>();
  const { base: { files } } = data;
  const images = lf2.images as ImageMgr
  for (const key of Object.keys(files)) {
    const img = images.find_by_pic_info(files[key]);
    if (img) ret.set(key, img.clone());
  }
  return ret;
}
const BODY_GEOMETRY = get_geometry(1, 1, 0.5, -0.5);
const BLOOD_GEOMETRY = get_geometry(1, 3, 0, -1.25);


export class EntityMainRender {
  readonly world_renderer: WorldRenderer;

  protected _game_time: number = -1;
  protected _time: number = 0;
  protected images!: Map<string, RImageInfo>;
  entity!: Entity;
  protected node!: T.Object3D;
  protected main_mesh!: T.Mesh<T.BufferGeometry, T.ShaderMaterial>;
  protected blood_mesh!: T.Mesh<T.BufferGeometry, T.MeshBasicMaterial>;

  protected variants = new Map<string, string[]>();
  protected shaking: number = 0;
  protected shaking_x: number = 0;
  protected _data?: IEntityData;

  protected _frame?: IFrameInfo;
  protected _facing?: TFace;
  protected _x?: number;
  protected _y?: number;
  protected _z?: number;
  protected x = 0;
  protected y = 0;
  protected z = 0;
  protected offset_x: number = 0;
  protected offset_y: number = 0;
  protected world!: World;
  protected lf2!: LF2;

  constructor(entity: Entity) {
    this.world_renderer = entity.world.renderer as WorldRenderer;
    this.reset(entity)
  }

  reset(entity: Entity) {
    this.entity = entity
    this.world = entity.world
    this.lf2 = entity.lf2;
    this._frame = void 0;
    this._facing = void 0;
    this._x = void 0;
    this._y = void 0;
    this._z = void 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.shaking = 0;
    this.shaking_x = 0;
    const { lf2, data } = entity;
    this.variants.clear();
    for (const k in data.base.files) {
      if (data.base.files[k].variants)
        this.variants.set(k, [k, ...data.base.files[k].variants]);
      else this.variants.set(k, [k]);
    }
    this._data = entity.data;
    this.images = get_img_map(lf2, entity.data);

    const texture = this.images.get("0")?.pic?.texture;
    const material = MaterialFactory.get(MaterialKind.Outline, OutlineMaterial, m => {
      m.uniforms.tex = { value: texture }
    });
    material.uniforms.outlineWidth.value = 1;
    const mesh = this.main_mesh = this.main_mesh || new T.Mesh(
      BODY_GEOMETRY, material
    )
    if (texture) texture.onUpdate = () => mesh.material.needsUpdate = true;
    mesh.visible = false;
    mesh.name = "Entity:" + data.id;
    if (typeof data.base.depth_test === "boolean")
      mesh.material.depthTest = data.base.depth_test;
    if (typeof data.base.depth_write === "boolean")
      mesh.material.depthWrite = data.base.depth_write;
    if (typeof data.base.render_order === "number")
      mesh.renderOrder = data.base.render_order;

    this.blood_mesh = this.blood_mesh || new T.Mesh(
      BLOOD_GEOMETRY,
      MaterialFactory.get(MaterialKind.Color, T.MeshBasicMaterial, m => m.color = new T.Color(1, 0, 0))
    )
    this.blood_mesh.visible = false;
    this.node = this.node || new T.Object3D();
  }

  on_mount() {
    this.reset(this.entity);
    this.node.add(
      this.main_mesh,
      this.blood_mesh
    )
    this.blood_mesh.position.z = 1;
    this.world_renderer.world_node.add(this.node);
  }

  on_unmount(): void {
    this.main_mesh.removeFromParent();
    this.blood_mesh.removeFromParent();
    this.node.removeFromParent();
  }

  apply_tex(entity: Entity, info: IFramePictureInfo | undefined) {
    const { images, main_mesh } = this
    if (!info) return;

    const { tex } = info;
    const real_tex = this.variants.get(tex)?.at(entity.variant) ?? tex;

    const img = images.get(real_tex);
    if (!img?.pic) return;
    const { x, y, w, h } = info;
    main_mesh.scale.set(w, h, 0);
    const { material: m } = main_mesh;
    m.uniforms.tex.value = img.pic.texture;
    m.uniforms.tw.value = img.w;
    m.uniforms.th.value = img.h;
    m.uniforms.tsw.value = img.scale;
    m.uniforms.tsh.value = img.scale;
    m.uniforms.x.value = x;
    m.uniforms.y.value = y;
    m.uniforms.w.value = w;
    m.uniforms.h.value = h;
    m.uniforms.flipX.value = entity.facing
  }

  update_shaking(dt: number) {
    const { entity: { shaking, facing } } = this;
    if (shaking == this.shaking) return;
    if (this.shaking = shaking) {
      const x = floor(this.shaking / 2) % 2 ? 1 : -1
      this.shaking_x = facing * random_in(0, 2) * x;
    } else {
      this.shaking_x = 0;
    }
  }
  prev_x: number = 0;
  prev_y: number = 0;
  prev_z: number = 0;
  render(dt: number) {
    const game_time = this.world.game_time.value
    const { entity, main_mesh } = this;
    let { x, y, z } = entity.position
    if (this._game_time != game_time) {
      this._game_time = game_time;
      this._time = 0;
      this.prev_x = x;
      this.prev_y = y;
      this.prev_z = z;
    } else {
      this._time += dt;
    }
    x = this.prev_x + (x - this.prev_x) * this._time / 16.6666;
    y = this.prev_y + (y - this.prev_y) * this._time / 16.6666;
    z = this.prev_z + (z - this.prev_z) * this._time / 16.6666;
    
    if (entity.frame.id === Builtin_FrameId.Gone) return;
    this.update_shaking(dt)
    const { frame, facing } = entity;
    if (entity.data !== this._data)
      this.reset(entity);

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
      const pic = frame.pic
      this.apply_tex(entity, pic)
      const { centerx, centery, state } = frame;
      const offset_x = entity.facing === 1 ? centerx : main_mesh.scale.x - centerx;
      if (state === StateEnum.Message) {
        let { cam_x } = this.entity.world.renderer;
        let cam_r = cam_x + this.entity.world.screen_w;
        cam_r -= main_mesh.scale.x - offset_x
        cam_x += offset_x
        x = clamp(x, cam_x, cam_r)
      }
      this.offset_x = -offset_x;
      this.offset_y = centery;
      if (pic?.r) {
        const c1x = vec2.x = pic.ox ?? (pic.w / 2)
        const c1y = vec2.y = -(pic.oy ?? (pic.h / 2))
        const cc = vec2.rotateAround(vec001, pic.r)
        this.offset_x -= (cc.x - c1x)
        this.offset_y -= (cc.y - c1y)
        main_mesh.setRotationFromAxisAngle(vec001, pic.r)
      }
      this.x = round(x);
      this.y = round(y - z / 2);
      this.z = round(z);
      this.node.position.set(this.x, this.y, this.z)
    }
    main_mesh.position.set(
      this.offset_x + this.shaking_x,
      this.offset_y,
      0
    );
    const visible = !entity.invisible;
    const blinking = !!entity.blinking;
    main_mesh.visible = visible;
    if (blinking && visible) {
      main_mesh.visible = 0 === Math.floor(entity.blinking / 4) % 2;
    }
    this.render_bpoint();
    this.render_outline();
  }
  private render_outline() {
    const { main_mesh } = this;
    if (this.entity.is_ghost) return;
    const { material: m } = main_mesh;
    if (m instanceof T.ShaderMaterial) {
      const { outline_color, outline_alpha } = this.entity;
      const enabled = this.entity.dataset('teamoutline_enabled')
      if (outline_color && enabled) {
        m.uniforms.outlineColor.value = new T.Color(outline_color);
        m.uniforms.outlineAlpha.value = outline_alpha ?? 0.7
      } else {
        m.uniforms.outlineAlpha.value = 0
      }
    }
  }
  private render_bpoint() {
    const { entity, main_mesh } = this;
    const { bpoint } = entity.frame
    const visible = !!bpoint && main_mesh.visible && entity.hp < entity.hp_max * 0.33;
    this.blood_mesh.visible = visible
    if (!bpoint || !visible) return

    let { x: bx, y: by, z: bz = 0.1, r = 0 } = bpoint;
    bx = entity.facing === 1 ? bx : main_mesh.scale.x - bx;
    this.blood_mesh.position.set(this.offset_x + bx, this.offset_y - by, bz);

  }
}
