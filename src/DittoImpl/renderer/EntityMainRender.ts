import type { Entity, IEntityData, IFrameInfo, IPictureInfo, IVector3, TFace } from "@/LF2";
import { Builtin_FrameId, clamp, floor, LF2, random_in, round, StateEnum, World } from "@/LF2";
import { IModelInfo } from "@/LF2/defines/IModelInfo";
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
  const { base: { files = {} } } = data;
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
  protected _x?: number;
  protected _y?: number;
  protected _z?: number;
  protected offset_x: number = 0;
  protected offset_y: number = 0;
  protected world!: World;
  protected lf2!: LF2;
  protected prev_position!: IVector3;
  protected position!: IVector3;
  protected files: Record<string, IPictureInfo> = {};
  protected models: Record<string, IModelInfo> = {};

  protected model_variants = new Map<string, string[]>();
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
    const material = MaterialFactory.get(MaterialKind.Outline, OutlineMaterial, m => {
      m.uniforms.tex = { value: texture }
    });
    material.uniforms.outlineWidth.value = 1;
    const mesh = this.main_mesh = this.main_mesh || new T.Mesh(
      BODY_GEOMETRY, material
    )
    mesh.material = material;

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
    this.prev_position = this.entity.position.clone()
    this.position = this.entity.position.clone()
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
    // const game_time = this.world.game_time.value
    const { entity, main_mesh } = this;
    let { x, y, z } = this.entity.position;
    if (entity.frame.id === Builtin_FrameId.Gone) return;
    this.update_shaking(dt)
    const { frame, facing } = entity;
    if (entity.data !== this._data)
      this.reset(entity);
    if (this._frame !== frame || this._facing !== facing) {
      // NOTE: flipX 与纹理必须一起设置，否则会有快速切换左右方向会有奇怪的表现
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
      const { centerx, centery, state } = frame;
      const offset_x = entity.facing === 1 ? centerx : main_mesh.scale.x - centerx;
      if (state === StateEnum.Message) {
        let { cam_x: l } = this.entity.world.renderer;
        let r = l + this.entity.world.screen_w;
        r -= main_mesh.scale.x - offset_x
        l += offset_x
        x = clamp(x, l, r)
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
    }

    if (this._x !== x || this._y !== y || this._z !== z) {
      this._x = x;
      this._y = y;
      this._z = z;
      this.node.position.set(
        round(x),
        round(y - z / 2),
        round(z),
      )
    }

    main_mesh.position.set(
      this.offset_x + this.shaking_x,
      this.offset_y,
      0
    );
    const { invisible, blinking } = entity;
    if (invisible) {
      main_mesh.visible = false;
    } else if (blinking) {
      main_mesh.visible = 0 === floor(blinking / 4) % 2;
    } else {
      main_mesh.visible = true;
    }

    this.render_bpoint();
    this.render_outline();
    if (this.lf2.ui?.id == "main_page") {
      const { material: m } = main_mesh;
      m.uniforms.gray.value = 0.3
      m.uniforms.mixColor.value = new T.Color('#364791')
      m.uniforms.mixStength.value = 0.3
      m.uniforms.outlineWidth.value = 1
      m.uniforms.outlineAlpha.value = 1
      m.uniforms.outlineColor.value = new T.Color('#131C47')
    }
  }
  private render_outline() {
    const { main_mesh: main_mesh } = this;
    if (this.entity.ghosted) return;
    const { material: m } = main_mesh;
    if (m instanceof T.ShaderMaterial) {
      const { outline_color, outline_alpha } = this.entity;
      const enabled = this.entity.dataset('teamoutline_enabled')
      if (outline_color && outline_alpha && enabled) {
        m.uniforms.outlineColor.value = new T.Color(outline_color);
        m.uniforms.outlineAlpha.value = outline_alpha ?? 0.7
      } else {
        m.uniforms.outlineAlpha.value = 0
      }
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
