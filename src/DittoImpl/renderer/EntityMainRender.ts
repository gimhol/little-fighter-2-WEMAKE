import type { Entity, IEntityData, IFrameInfo, IPictureInfo, TFace } from "@/LF2";
import { clamp, floor, LF2, random_in, StateEnum, World } from "@/LF2";
import { IModelInfo } from "@/LF2/defines/IModelInfo";
import * as T from "../_t";
import { MeshBasicMaterial, Vector3 } from "../_t";
import type { ImageMgr } from "../ImageMgr/ImageMgr";
import type { RImageInfo } from "../RImageInfo";
import type { EntityRenderer } from "./EntityRenderer";
import { MaterialFactory, MaterialKind } from "./factory/MaterialFactory";
import { get_static_plane_geometry } from "./GeometryKeeper";
import { OutlineMaterial } from "./materials/OutlineMaterial";
import type { WorldRenderer } from "./WorldRenderer";

function get_img_map(lf2: LF2, data: IEntityData): Map<string, RImageInfo> {
  const ret = new Map<string, RImageInfo>();
  const { base: { files = {} } } = data;
  const images = lf2.images as ImageMgr
  for (const key of Object.keys(files)) {
    const img = images.find_by_pic_info(files[key]);
    if (img) ret.set(key, img.clone());
  }
  return ret;
}
const BODY_GEOMETRY = get_static_plane_geometry(1, 1, 0.5, -0.5);
const BLOOD_GEOMETRY = get_static_plane_geometry(1, 3, 0, -1.25);

export class EntityMainRender {
  readonly world_renderer: WorldRenderer;
  readonly owner: EntityRenderer;
  protected _game_time: number = -1;
  protected _time: number = 0;
  protected images!: Map<string, RImageInfo>;
  protected entity!: Entity;
  protected node!: T.Object3D;
  protected main_mesh!: T.Mesh<T.BufferGeometry, OutlineMaterial>;
  protected blood_mesh!: T.Mesh<T.BufferGeometry, T.MeshBasicMaterial>;
  protected file_variants = new Map<string, string[]>();
  protected shaking: number = 0;
  protected shaking_x: number = 0;
  protected _data?: IEntityData;
  protected _frame?: IFrameInfo;
  protected _facing?: TFace;

  protected _p0 = new Vector3()
  protected _p1 = new Vector3()
  protected offset_x: number = 0;
  protected offset_y: number = 0;
  protected world!: World;
  protected lf2!: LF2;
  protected files: Record<string, IPictureInfo> = {};
  protected models: Record<string, IModelInfo> = {};
  protected model_variants = new Map<string, string[]>();
  constructor(owner: EntityRenderer) {
    this.owner = owner;
    this.world_renderer = owner.owner;
    this.reset(owner.entity)
  }
  reset(entity: Entity) {
    this.entity = entity
    this.world = entity.world
    this.lf2 = entity.lf2;
    this._frame = void 0;
    this._facing = void 0;
    this._p0.set(0, 0, 0)
    this._p1.set(0, 0, 0)
    this.shaking = 0;
    this.shaking_x = 0;

    const { lf2, data } = entity;
    this.file_variants.clear();
    const files = this.files = data.base.files ?? {}
    for (const k in files) {
      const file = files[k]
      if (!file.variants?.length) continue;
      this.file_variants.set(k, [k, ...file.variants]);
    }

    const models = this.models = data.base.models ?? {}
    for (const k in models) {
      const model = models[k]
      if (!model.variants?.length) continue;
      this.model_variants.set(k, [k, ...model.variants]);
    }

    this._data = entity.data;
    this.images = get_img_map(lf2, entity.data);

    const texture = this.images.get("0")?.pic?.texture;

    if (!this.main_mesh) {
      const material = MaterialFactory.get(MaterialKind.Outline, OutlineMaterial);
      material.texture = texture;
      material.outlineWidth = 1;
      this.main_mesh = new T.Mesh(BODY_GEOMETRY, material)
    }

    const mesh = this.main_mesh;
    if (texture) texture.onUpdate = () => mesh.material.needsUpdate = true;
    mesh.visible = false;
    mesh.name = "Entity:" + data.id;
    if (typeof data.base.depth_test === "boolean")
      mesh.material.depthTest = data.base.depth_test;
    if (typeof data.base.depth_write === "boolean")
      mesh.material.depthWrite = data.base.depth_write;
    if (typeof data.base.render_order === "number")
      mesh.renderOrder = data.base.render_order;

    if (!this.blood_mesh) {
      const m = MaterialFactory.get(MaterialKind.Color, MeshBasicMaterial);
      m.color = new T.Color(1, 0, 0)
      this.blood_mesh = new T.Mesh(BLOOD_GEOMETRY, m)
    }
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
    this.update_position(true)
    this.render_outline();

  }

  on_unmount(): void {
    this.main_mesh.removeFromParent();
    this.blood_mesh.removeFromParent();
    this.node.removeFromParent();
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
  render(dt: number) {
    const { entity, main_mesh } = this;
    const { frame, facing } = entity;
    if (this.owner.owner.dirty) {
      this.update_position();
      const { centerx, centery, pic: { w = 0 } = {} } = frame;
      const offset_x = facing === 1 ? centerx : w - centerx;
      this.offset_x = -offset_x;
      this.offset_y = centery;

      if (entity.data !== this._data)
        this.reset(entity);

      if (this._frame !== frame || this._facing !== facing) {
        this._frame = frame;
        this._facing = facing;
        const { pic } = frame
        const { variant } = entity;
        const { images } = this
        if (pic) {
          let { tex } = pic;
          if (variant) do {
            const variants = this.file_variants.get(tex);
            if (!variants?.length) break;
            const real_tex = variants[variant];
            if (!real_tex) continue;
            tex = real_tex
          } while (0);

          const img = images.get(tex);
          if (img?.pic) {
            const { x, y, w, h } = pic;
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
            m.uniforms.flipX.value = entity.facing;
          }
        }

        // if (pic?.r) {
        //   const c1x = vec2.x = pic.ox ?? (pic.w / 2)
        //   const c1y = vec2.y = -(pic.oy ?? (pic.h / 2))
        //   const cc = vec2.rotateAround(vec001, pic.r)
        //   this.offset_x -= (cc.x - c1x)
        //   this.offset_y -= (cc.y - c1y)
        //   main_mesh.setRotationFromAxisAngle(vec001, pic.r)
        // }
      }
    }

    this.update_shaking(dt)

    const holder = (
      this.entity.bearer?.renderer ?? this.entity.catcher?.renderer
    ) as EntityRenderer

    if (!holder) {
      this.node.position.lerpVectors(this._p0, this._p1, this.world_renderer.dfactor)
    } else {
      this.node.position.copy(this._p1)
      this.node.position.x -= holder.main._p1.x - holder.main.node.position.x
      this.node.position.y -= holder.main._p1.y - holder.main.node.position.y
      this.node.position.z -= holder.main._p1.z - holder.main.node.position.z
    }

    main_mesh.position.set(
      this.offset_x + this.shaking_x,
      this.offset_y,
      0
    );
    const { invisible } = this.owner;
    const { blinking } = entity;
    if (invisible) {
      main_mesh.visible = false;
    } else if (blinking) {
      main_mesh.visible = 0 === floor(blinking / 4) % 2;
    } else {
      main_mesh.visible = true;
    }

    this.render_bpoint();
    this.render_outline();
  }
  update_position(immidiate: boolean = false) {
    let { x, y, z } = this.entity.position;
    const { facing, state } = this.entity;
    if (state === StateEnum.Message) {
      const { centerx, pic: { w = 0 } = {} } = this.entity.frame;
      let l = this.world_renderer.camera.position.x;
      let r = l + this.entity.world.screen_w;
      const offset_x = facing === 1 ? centerx : w - centerx;
      r -= w - offset_x
      l += offset_x
      x = clamp(x, l, r)
    }

    this._p0.copy(this._p1);
    this._p1.set(x, y - z / 2, z);
    if (immidiate) {
      this._p0.copy(this._p1);
      this.node.position.copy(this._p1)
    }
  }
  private render_outline() {
    const { main_mesh: main_mesh } = this;
    if (this.entity.ghosted) return;
    const { material: m } = main_mesh;
    const { outline_color, outline_alpha } = this.entity;
    const enabled = this.entity.dataset('teamoutline_enabled')
    if (outline_color && outline_alpha && enabled) {
      m.outlineColor = new T.Color(outline_color);
      m.outlineAlpha = outline_alpha ?? 0.7
    } else {
      m.outlineAlpha = 0
    }
    if (this.lf2.ui?.id == "main_page") {
      const { material: m } = this.main_mesh;
      m.gray = 0.3
      m.mixColor = new T.Color('#364791')
      m.mixStength = 0.3
      m.outlineWidth = 1
      m.outlineAlpha = 1
      m.outlineColor = new T.Color('#131C47')
    } else {
      m.gray = 0;
      m.mixColor = ''
      m.mixStength = 0;
    }
  }
  private render_bpoint() {
    const { entity, main_mesh: main_mesh } = this;
    const { bpoint } = entity.frame
    const visible = !!bpoint && main_mesh.visible && entity.hp < entity.hp_max * 0.33;
    this.blood_mesh.visible = visible
    if (!bpoint || !visible) return

    let { x: bx, y: by, z: bz = 0.1, r = 0 } = bpoint;
    bx = entity.facing === 1 ? bx : main_mesh.scale.x - bx;
    this.blood_mesh.position.set(this.offset_x + bx, this.offset_y - by, bz);

  }
}
