import type { IEntityData, IFrameInfo, ITexturePieceInfo, TFace } from "@/LF2/defines";
import { Builtin_FrameId, Defines, StateEnum } from "@/LF2/defines";
import type { Entity } from "@/LF2/entity/Entity";
import { LF2 } from "@/LF2/LF2";
import { clamp, floor, random_in, round } from "@/LF2/utils";
import * as T from "../_t";
import type { ImageMgr } from "../ImageMgr";
import type { RImageInfo } from "../RImageInfo";
import { get_geometry } from "./GeometryKeeper";
import { get_color_material } from "./MaterialKeeper";
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
const BLOOD_MESH_MATERIAL = get_color_material(new T.Color(1, 0, 0))

const vertex_shader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const fragment_shader = `
  uniform sampler2D pTexture;
  uniform float offsetX;
  uniform float offsetY;
  uniform float repeatW;
  uniform float repeatH;
  uniform float outlineWidth;
  uniform float outlineAlpha;
  uniform vec3 outlineColor;
  
  varying vec2 vUv;
  
  const float gamma = 2.2;
  vec3 gamma_correct(vec3 color) {
    return pow(color, vec3(1.0 / gamma));
  }
  vec3 gamma_invert(vec3 color) {
    return pow(color, vec3(gamma));
  }
  void main() {
    vec2 uv = vec2(
      (vUv.x * repeatW) + offsetX,
      (vUv.y * repeatH) + offsetY
    );
    vec4 color = texture2D(pTexture, uv);
    color.rgb = gamma_correct(color.rgb);
    if(outlineAlpha <= 0.0) {
      gl_FragColor = color;
      return;
    }

    float outline = 0.0;
    vec2 texel = vec2(outlineWidth) / vec2(textureSize(pTexture, 0));
    float center = texture2D(pTexture, uv).a;
    float up     = texture2D(pTexture, uv + vec2(0, -texel.y)).a;
    float down   = texture2D(pTexture, uv + vec2(0,  texel.y)).a;
    float left   = texture2D(pTexture, uv + vec2(-texel.x, 0)).a;
    float right  = texture2D(pTexture, uv + vec2( texel.x, 0)).a;
    outline = max(
      max(abs(center - up), abs(center - down)),
      max(abs(center - left), abs(center - right))
    );
    if (outline > 0.1 && center < 0.1) {
      gl_FragColor.rgb = gamma_correct(outlineColor);
      gl_FragColor.a = outlineAlpha;
    } else {
      gl_FragColor = color;
    }
  }
`
function get_material(texture: T.Texture<unknown> | undefined) {
  return new T.ShaderMaterial({
    uniforms: {
      pTexture: { value: texture },
      offsetX: { value: 0 },
      offsetY: { value: 0 },
      repeatW: { value: 0 },
      repeatH: { value: 0 },
      outlineColor: { value: new T.Color("#ff0000") },
      outlineAlpha: { value: 0.8 },
      outlineWidth: { value: 1 }
    },
    vertexShader: vertex_shader,
    fragmentShader: fragment_shader,
    transparent: true
  });
}
export class EntityRender {
  readonly world_renderer: WorldRenderer;

  protected images!: Map<string, RImageInfo>;
  entity!: Entity;
  protected node!: T.Object3D;
  protected main_mesh!: T.Mesh<T.BufferGeometry, T.MeshBasicMaterial>;
  protected blood_mesh!: T.Mesh<T.BufferGeometry, T.MeshBasicMaterial>;

  protected variants = new Map<string, string[]>();
  protected shaking: number = 0;
  protected shaking_x: number = 0;
  protected _data?: IEntityData;

  protected _tex?: ITexturePieceInfo
  protected _frame?: IFrameInfo;
  protected _facing?: TFace;
  protected _x?: number;
  protected _y?: number;
  protected _z?: number;
  protected x = 0;
  protected y = 0;
  protected z = 0;
  protected outline_width: number = 2;
  outline_color: string | undefined = void 0;
  protected offset_x: number = 0;
  protected offset_y: number = 0;

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
    const material = get_material(texture);
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

    this.blood_mesh = this.blood_mesh || new T.Mesh(BLOOD_GEOMETRY, BLOOD_MESH_MATERIAL)
    this.blood_mesh.visible = false;
    this.node = this.node || new T.Object3D();
  }

  on_mount() {
    this.reset(this.entity);
    this.node.add(
      // this.outline_mesh, 
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

  apply_tex(entity: Entity, info: ITexturePieceInfo | undefined) {
    const { images, main_mesh } = this
    if (info) {
      const { x, y, w, h, tex, pixel_w, pixel_h } = info;
      const real_tex = this.variants.get(tex)?.at(entity.variant) ?? tex;

      const img = images.get(real_tex);
      if (img?.pic) {
        const { material: m } = main_mesh;
        // 检查材质类型并更新纹理
        if (m instanceof T.ShaderMaterial) {
          m.uniforms.pTexture.value = img.pic.texture;
          m.uniforms.offsetX.value = x;
          m.uniforms.offsetY.value = y;
          m.uniforms.repeatW.value = w;
          m.uniforms.repeatH.value = h;
        } else {
          img.pic.texture.offset.set(x, y);
          img.pic.texture.repeat.set(w, h);
          m.map = img.pic.texture;
        }
      }
      main_mesh.scale.set(pixel_w, pixel_h, 0);

    }
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
    if (entity.frame.id === Builtin_FrameId.Gone) return;
    this.update_shaking(dt)
    const { frame, facing } = entity;
    if (entity.data !== this._data)
      this.reset(entity);
    let { x, y, z } = entity.position
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
      const tex = pic?.[facing]
      if (this._tex !== tex)
        this.apply_tex(entity, this._tex = tex)
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
    if (this.entity.outline_color != this.outline_color) {
      this.outline_color = this.entity.outline_color;
    }
    const { material: m } = main_mesh;
    if (m instanceof T.ShaderMaterial) {
      if (this.outline_color) {
        m.uniforms.outlineColor.value = new T.Color(this.outline_color);
        m.uniforms.outlineAlpha.value = 0.8
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
