
import { Background } from "../../LF2/bg/Background";
import type { Entity } from "../../LF2/entity/Entity";
import { clamp } from "../../LF2/utils";
import * as T from "../_t";
import { WorldRenderer } from "./WorldRenderer";

export class EntityShadowRender {
  readonly renderer_type: string = "Shadow";
  readonly mesh: T.Mesh;
  readonly entity: Entity;
  get world() { return this.entity.world }
  get lf2() { return this.entity.lf2 }
  bg: Readonly<Background> | undefined = void 0
  protected material = new T.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
  });
  get visible() {
    return this.mesh.visible;
  }
  set visible(v) {
    this.mesh.visible = v;
  }
  constructor(entity: Entity) {
    const { lf2 } = entity;
    this.entity = entity
    this.mesh = new T.Mesh(
      new T.PlaneGeometry(0, 0),
      this.material,
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

  render() {
    const { bg } = this.world
    if (bg != this.bg) {
      this.bg = this.entity.world.bg;
      const pic = this.lf2.images.create_pic_by_img_key(bg.data.base.shadow);
      const [sw, sh] = bg.data.base.shadowsize || [30, 30];
      this.mesh.geometry = new T.PlaneGeometry(sw, sh);
      this.material.map = pic.texture;
      this.material.opacity = 1;
      this.material.needsUpdate = true;
    }


    const {
      frame,
      position: { x, z, y },
      invisible
    } = this.entity;
    this.mesh.position.set(
      Math.floor(x),
      Math.floor(-z / 2),
      Math.floor(z - 550),
    );
    const scale = 0.5 + 0.5 * clamp(250 - y, 0, 250) / 250
    const opacity = 0.3 + 0.7 * clamp(250 - y, 0, 250) / 250
    this.mesh.scale.set(scale, scale, 1)
    this.material.opacity = opacity;

    this.mesh.visible = !invisible && !frame.no_shadow;
  }
}

export default EntityShadowRender