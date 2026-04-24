import { random_in } from "@/LF2";
import { BuiltIn_OID } from "@/LF2/defines";
import type { IWorldRenderer } from "@/LF2/ditto/render/IWorldRenderer";
import { is_fighter, type Entity } from "@/LF2/entity";
import type { LF2 } from "@/LF2/LF2";
import type { World } from "@/LF2/World";
import { Camera, Object3D, OrthographicCamera } from "../_t";
import { __Scene } from "../Scene";
import { BgRender } from "./BgRender";
import { EntityRenderer } from "./EntityRenderer";
import { EntityStatRender } from "./EntityStatRender";
import { FrameIndicators } from "./FrameIndicators";
import { INDICATINGS } from "./INDICATINGS";

export class WorldRenderer implements IWorldRenderer {
  lf2: LF2;
  world: World;
  bg_render: BgRender;
  scene: __Scene;
  camera: Camera;
  ui_container: Object3D;
  readonly entity_renderers = new Set<EntityRenderer>();
  readonly world_node = new Object3D();

  private _indicator_flags: number = 0;
  get indicator_flags() {
    return this._indicator_flags;
  }
  set indicator_flags(v: number) {
    if (this._indicator_flags === v) return;
    this._indicator_flags = v;
    for (const renderer of this.entity_renderers) {
      this.ensure_stat(renderer)
      this.ensure_indi(renderer)
    }
  }
  get cam_x(): number { return this.camera.position.x }
  set cam_x(v: number) { this.set_cam_pos(v, this.cam_y) }
  get cam_y(): number { return this.camera.position.y }
  set cam_y(v: number) { this.set_cam_pos(this.cam_x, v) }
  set_cam_pos(x: number, y: number): void {
    x = Math.max(0, x)
    this.camera.position.x = x;
    this.camera.position.y = y;
    this.ui_container.position.x = x;
    this.ui_container.position.y = y + this.world.screen_h;
  }
  constructor(world: World) {
    if (!world) debugger;
    if (!world.lf2) debugger;

    this.world = world;
    this.lf2 = world.lf2;
    const w = world.screen_w;
    const h = world.screen_h;
    this.bg_render = new BgRender(this);
    this.scene = new __Scene(world.lf2).set_size(w * 4, h * 4);
    this.scene.inner.add(this.world_node);
    {
      const camera = this.camera = new OrthographicCamera()
      camera.left = 0;
      camera.right = w;
      camera.top = h;
      camera.bottom = 0;
      camera.near = 0.1;
      camera.far = 2000;
      camera.position.set(0, 0, 10)
      camera.name = "default_orthographic_camera"
      this.scene.add_camera(camera);
      camera.updateProjectionMatrix();
    }
    this.ui_container = new Object3D();
    this.scene.inner.add(this.ui_container);
  }
  ensure_stat(pack: EntityRenderer) {
    // Criminal...?
    if (
      is_fighter(pack.entity) ||
      pack.entity.data.id === BuiltIn_OID.Criminal ||
      (this._indicator_flags & INDICATINGS.ctrl)
    ) {
      if (!pack.stat) {
        pack.stat = new EntityStatRender(pack.entity, this);
        pack.stat.on_mount()
      }
    } else if (pack.stat) {
      pack.stat.on_unmount();
      pack.stat = null
    }
  }
  ensure_indi(pack: EntityRenderer) {
    if (this._indicator_flags ^ INDICATINGS.ctrl) {
      if (!pack.indi) pack.indi = new FrameIndicators(pack.entity);
      pack.indi.flags = this._indicator_flags
    } else if (pack.indi) {
      pack.indi.on_unmount();
      pack.indi = null
    }
  }
  add_entity(entity: Entity): void {
    const pack: EntityRenderer = entity.renderer ? entity.renderer : (
      entity.renderer = new EntityRenderer(entity)
    );
    this.ensure_stat(pack)
    this.ensure_indi(pack)
    pack.mount();
    this.entity_renderers.add(pack)
  }

  del_entity(e: Entity): void {
    const renderer: EntityRenderer = e.renderer;
    if (!renderer) return;
    renderer.unmount();
    this.entity_renderers.delete(renderer);
  }

  render(dt: number): void {
    const { indicator_flags, transform } = this.world;
    let { x, y, z, earthquake, earthquake_level, scale_x, scale_y, scale_z } = transform
    if (earthquake) x += random_in(-earthquake_level, earthquake_level)
    this.world_node.position.set(x, y, z);
    this.world_node.scale.set(scale_x, scale_y, scale_z);
    if (indicator_flags != this.indicator_flags)
      this.indicator_flags = indicator_flags;
    this.bg_render.render(dt);
    for (const renderer of this.entity_renderers)
      renderer.render(dt)
    for (const ui_stack of this.lf2.ui_stacks)
      ui_stack.ui?.renderer.render(dt)
    this.scene.render();
  }

  dispose() {
    this.scene.dispose();
    this.bg_render.release();
  }
}
