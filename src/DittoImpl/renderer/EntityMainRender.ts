import type { Entity, IEntityData, IFrameInfo, IPictureInfo, TFace } from "@/LF2";
import { Buff_Electroshock, clamp, floor, LF2, random_in, StateEnum, World } from "@/LF2";
import { IModelInfo } from "@/LF2/defines/IModelInfo";
import { BufferGeometry, Color, Mesh, MeshBasicMaterial, Object3D, Vector3 } from "../_t";
import type { ImageMgr } from "../ImageMgr/ImageMgr";
import type { RImageInfo } from "../RImageInfo";
import type { EntityRenderer } from "./EntityRenderer";
import { MeshFactory, MeshKind } from "./factory";
import { OutlineMaterial } from "./materials/OutlineMaterial";
import type { WorldRenderer } from "./WorldRenderer";

const get_img_map = (lf2: LF2, data: IEntityData, out: Map<string, RImageInfo>): void => {
  out.clear();
  const { base: { files = {} } } = data;
  const images = lf2.images as ImageMgr;
  for (const key of Object.keys(files)) {
    const img = images.find_by_pic_info(files[key]);
    img && out.set(key, img.clone());
  }
};


export class EntityMainRender {
  readonly world_renderer: WorldRenderer;
  readonly owner: EntityRenderer;
  readonly world: World;
  readonly lf2: LF2;
  protected images = new Map<string, RImageInfo>();
  protected entity: Entity;
  protected node = new Object3D();
  protected main_mesh = MeshFactory.get(MeshKind.Entity, Mesh<BufferGeometry, OutlineMaterial>);
  protected blood_mesh = MeshFactory.get(MeshKind.Blood, Mesh<BufferGeometry, MeshBasicMaterial>);
  protected file_variants = new Map<string, string[]>();
  protected shaking = 0;
  protected shaking_x = 0;
  protected data: IEntityData;
  protected frame: IFrameInfo;
  protected facing: TFace;
  protected p0 = new Vector3();
  protected p1 = new Vector3();
  protected centerx = 0;
  protected centery = 0;
  protected files: Record<string, IPictureInfo> = {};
  protected models: Record<string, IModelInfo> = {};
  protected model_variants = new Map<string, string[]>();
  protected img: RImageInfo | undefined;

  constructor(owner: EntityRenderer) {
    this.owner = owner;
    this.world_renderer = owner.owner;
    const { entity } = owner;
    this.entity = entity;
    this.lf2 = entity.lf2;
    this.world = entity.world;
    this.data = entity.data;
    this.frame = entity.frame;
    this.facing = entity.facing;
    this.node.add(this.main_mesh, this.blood_mesh)
  }

  reset(): void {
    const { entity } = this;
    this.frame = entity.frame;
    this.facing = entity.facing;
    this.p0.set(0, 0, 0);
    this.p1.set(0, 0, 0);
    this.shaking = 0;
    this.shaking_x = 0;
    const { data } = entity;
    this.file_variants.clear();
    const files = this.files = data.base.files ?? {};
    for (const k in files) {
      const file = files[k];
      file.variants?.length && this.file_variants.set(k, [k, ...file.variants]);
    }

    const models = this.models = data.base.models ?? {};
    for (const k in models) {
      const model = models[k];
      model.variants?.length && this.model_variants.set(k, [k, ...model.variants]);
    }

    this.data = data;
    get_img_map(this.lf2, data, this.images);
    for (const img of this.images.values()) {
      img.pic?.texture && (img.pic.texture.needsUpdate = true);
    }

    this.main_mesh.visible = false;
    this.main_mesh.name = `Entity: ${this.entity.name}`;

    this.blood_mesh.visible = false;
    this.blood_mesh.name = `Blood: ${this.entity.name}`;
  }

  on_mount(): void {
    this.reset()
    this.update_texture();
    this.update_outline();
    this.update_position(true);
    this.world_renderer.world_node.add(this.node);
  }

  on_unmount(): void {
    this.node.removeFromParent();
  }

  update_shaking(): void {
    let { shaking, facing, buffs } = this.entity;

    if (!shaking) {
      for (const [, b] of buffs) {
        if (b.kind === Buff_Electroshock.KIND) {
          shaking = b.duration - b.lifetime;
        }
      }
    }
    if (shaking != this.shaking) {
      this.shaking = shaking;
      this.shaking_x = shaking ? facing * random_in(0, 2) * (floor(shaking / 2) % 2 ? 1 : -1) : 0;
    }
  }

  render(): void {
    const { entity, main_mesh } = this;
    if (this.owner.owner.dirty) {
      const { frame, facing, data } = entity;
      if (data != this.data) {
        this.reset();
        this.update_texture();
        this.update_outline();
        this.update_position(true);
      } else if (this.frame !== frame || this.facing !== facing) {
        this.frame = frame;
        this.facing = facing;
        this.update_texture();
        this.update_position();
      } else {
        this.update_position();
      }
    }

    this.update_shaking();
    const holder = (this.entity.bearer?.renderer ?? this.entity.catcher?.renderer) as EntityRenderer;
    if (!holder) {
      let { dfactor } = this.world_renderer;
      entity.lifetime === 0 && (dfactor = 1);
      this.node.position.lerpVectors(this.p0, this.p1, dfactor);
    } else {
      this.node.position.copy(this.p1);
      this.node.position.x -= holder.main.p1.x - holder.main.node.position.x;
      this.node.position.y -= holder.main.p1.y - holder.main.node.position.y;
      this.node.position.z -= holder.main.p1.z - holder.main.node.position.z;
    }
    main_mesh.position.set(this.centerx + this.shaking_x, this.centery, 0);
    const { invisible } = this.owner;
    const { blinking } = entity;

    if (invisible) {
      main_mesh.visible = false;
    } else if (blinking) {
      main_mesh.visible = floor(blinking / 4) % 2 === 0;
    } else {
      main_mesh.visible = true;
    }

    this.render_bpoint();
    this.update_outline();
  }

  private update_texture() {
    const { main_mesh, entity } = this;
    const { frame, facing, variant } = entity;
    const { centerx, centery, width, height } = frame;
    this.centerx = facing === 1 ? -centerx : centerx - width;
    this.centery = centery;
    const { pic } = frame;
    const { images } = this;
    main_mesh.scale.set(width, height, 0);

    if (!pic) return;

    const { material: m } = main_mesh;

    let { tex } = pic;
    if (variant) tex = this.file_variants.get(tex)?.at(variant) ?? tex;

    const img = this.img = images.get(tex);
    if (img?.pic) {
      m.uniforms.tex.value = img.pic.texture;
      m.uniforms.tw.value = img.w;
      m.uniforms.th.value = img.h;
      m.uniforms.tsw.value = img.scale;
      m.uniforms.tsh.value = img.scale;
    } else {
      m.uniforms.tex.value = void 0;
    }
    m.uniforms.x.value = pic.x;
    m.uniforms.y.value = pic.y;
    m.uniforms.w.value = pic.w;
    m.uniforms.h.value = pic.h;
    m.uniforms.flipX.value = entity.facing;
  }

  update_position(immediate = false): void {
    let { x, y, z } = this.entity.position;
    const { facing, state } = this.entity;

    if (state === StateEnum.Message) {
      const { centerx, width } = this.entity.frame;
      const cameraX = this.world_renderer.camera.position.x;
      const screenW = this.entity.world.screen_w;
      const offsetX = facing === 1 ? centerx : width - centerx;
      const left = cameraX + offsetX;
      const right = cameraX + screenW - (width - offsetX);
      x = clamp(x, left, right);
    }
    this.p0.copy(this.p1);
    this.p1.set(x, y - z / 2, z);
    immediate && (this.p0.copy(this.p1), this.node.position.copy(this.p1));
  }

  private update_outline(): void {
    const { main_mesh } = this;
    if (this.entity.ghosted) return;
    const { material: m } = main_mesh;
    const { outline_color, outline_alpha, outline_width } = this.entity;
    const enabled = this.entity.dataset('teamoutline_enabled');

    if (outline_color && outline_alpha && enabled) {
      m.outlineColor = new Color(outline_color);
      m.outlineAlpha = outline_alpha ?? 0.7;
      m.outlineWidth = outline_width * (this.img?.scale ?? 1)
    } else {
      m.outlineAlpha = 0;
    }

    if (this.lf2.ui?.id === "main_page") {
      m.gray = 0.3;
      m.mixColor.set('#364791');
      m.mixStength = 0.3;
      m.outlineWidth = 1;
      m.outlineAlpha = 1;
      m.outlineColor.set('#131C47')
    } else {
      m.gray = 0;
      m.mixColor = '';
      m.mixStength = 0;
    }
  }

  private render_bpoint(): void {
    const { entity, main_mesh } = this;
    const { bpoint } = entity.frame;

    const visible = !!bpoint && main_mesh.visible && entity.hp < entity.hp_max * 0.33;
    this.blood_mesh.visible = visible;

    if (!bpoint || !visible) return;

    let { x: bx, y: by, z: bz = 0.1, r = 0 } = bpoint;
    bx = entity.facing === 1 ? bx : main_mesh.scale.x - bx;
    this.blood_mesh.position.set(this.centerx + bx, this.centery - by, bz);
  }
}