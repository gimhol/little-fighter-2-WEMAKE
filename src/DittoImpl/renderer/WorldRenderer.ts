import { BuiltIn_OID } from "@/LF2/defines";
import type { IWorldRenderer } from "@/LF2/ditto/render/IWorldRenderer";
import { is_fighter, type Entity } from "@/LF2/entity";
import type { LF2 } from "@/LF2/LF2";
import type { World } from "@/LF2/World";
import { Camera, Object3D, OrthographicCamera } from "../_t";
import { Scene } from "../Scene";
import { BgRender } from "./BgRender";
import { EntityRenderer as EntityRenderer } from "./EntityRenderer";
import { EntityStatRender } from "./EntityStatRender";
import { FrameIndicators } from "./FrameIndicators";

export class WorldRenderer implements IWorldRenderer {
  lf2: LF2;
  world: World;
  bg_render: BgRender;
  scene: Scene;
  camera: Camera;
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
      if (v) {
        if (!renderer.indi) renderer.indi = new FrameIndicators(renderer.entity)
        renderer.indi.flags = v;
      } else {
        if (renderer.indi) renderer.indi.on_unmount();
        renderer.indi = null;
      }
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
    for (const stack of this.lf2.ui_stacks) {
      for (const ui of stack.uis) {
        const [a, b] = ui.pos.default_value;
        const [, , c] = ui.pos.value;
        ui.pos.value = [a + x, b + y, c];
        ui.renderer.x = a + x;
        ui.renderer.y = -(b + y);
      }
    }
  }
  constructor(world: World) {
    if (!world) debugger;
    if (!world.lf2) debugger;

    this.world = world;
    this.lf2 = world.lf2;
    const w = world.screen_w;
    const h = world.screen_h;
    this.bg_render = new BgRender(this);
    this.scene = new Scene(world.lf2).set_size(w * 4, h * 4);
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
    {
      // const camera = this.camera = new PerspectiveCamera()
      // camera.aspect = 1;
      // camera.near = 0.1;
      // camera.far = 2000;
      // camera.position.set(0, 0, 10)
      // camera.name = "default_orthographic_camera"
      // this.scene.add_camera(camera);
      // camera.updateProjectionMatrix(); 
    }

  }
  add_entity(entity: Entity): void {
    const pack: EntityRenderer = entity.renderer ? entity.renderer : (
      entity.renderer = new EntityRenderer(entity)
    );

    // Criminal...?
    if (is_fighter(entity) || entity.data.id === BuiltIn_OID.Criminal) {
      pack.stat = new EntityStatRender(entity, this);
    } else if (pack.stat) {
      pack.stat.on_unmount();
      pack.stat = null
    }

    if (this.indicator_flags) {
      pack.indi = new FrameIndicators(entity);
      pack.indi.flags = this.indicator_flags
    } else if (pack.indi) {
      pack.indi.on_unmount();
      pack.indi = null
    }
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
    const { indicator_flags, transform: { x, y, z } } = this.world;
    this.world_node.position.set(x, y, z);
    if (indicator_flags != this.indicator_flags)
      this.indicator_flags = indicator_flags;
    this.bg_render.render();
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
