import { BuiltIn_OID } from "@/LF2/defines";
import type { IWorldRenderer } from "@/LF2/ditto/render/IWorldRenderer";
import { is_character, type Entity } from "@/LF2/entity";
import type { LF2 } from "@/LF2/LF2";
import type { World } from "@/LF2/World";
import { Camera, OrthographicCamera } from "../_t";
import { Scene } from "../Scene";
import { BgRender } from "./BgRender";
import { EntityStatRender } from "./EntityStatRender";
import { EntityRenderPack } from "./EntityRenderPack";
import { FrameIndicators } from "./FrameIndicators";

export class WorldRenderer implements IWorldRenderer {
  lf2: LF2;
  world: World;
  bg_render: BgRender;
  scene: Scene;
  camera: Camera;
  entity_renderer_packs = new Map<Entity, EntityRenderPack>();

  private _indicator_flags: number = 0;
  get indicator_flags() {
    return this._indicator_flags;
  }
  set indicator_flags(v: number) {
    if (this._indicator_flags === v) return;
    this._indicator_flags = v;
    for (const [, pack] of this.entity_renderer_packs) {
      if (v) {
        if (!pack.indi) pack.indi = new FrameIndicators(pack.entity)
        pack.indi.flags = v;
      } else {
        if (pack.indi) pack.indi.on_unmount();
        pack.indi = void 0;
      }
    }
  }
  get cam_x(): number {
    return this.camera.position.x
  }
  set cam_x(v: number) {
    this.camera.position.x = v;
    for (const stack of this.lf2.ui_stacks) {
      for (const ui of stack.uis) {
        const [a, b, c] = ui.pos.default_value;
        ui.pos.value = [a + v, b, c];
        ui.renderer.x = v;
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

    const pack = new EntityRenderPack(entity);
  
    // Criminal...?
    if (is_character(entity) || entity.data.id === BuiltIn_OID.Criminal) {
      pack.stat = new EntityStatRender(entity, this);
    }
    if (this.indicator_flags) {
      pack.indi = new FrameIndicators(entity);
      pack.indi.flags = this.indicator_flags
    }
    pack.mount();
    this.entity_renderer_packs.set(entity, pack)
  }

  del_entity(e: Entity): void {
    const pack = this.entity_renderer_packs.get(e);
    if (!pack) return;
    pack.unmount();
    this.entity_renderer_packs.delete(e);
  }

  render(dt: number): void {
    const { indicator_flags } = this.world;
    if (indicator_flags != this.indicator_flags)
      this.indicator_flags = indicator_flags;
    this.bg_render.render();
    for (const [, pack] of this.entity_renderer_packs) {
      pack.render(dt)
    }
    this.lf2.ui?.renderer.render(dt)
    this.scene.render();
  }

  dispose() {
    this.scene.dispose();
    this.bg_render.release();
  }
}
