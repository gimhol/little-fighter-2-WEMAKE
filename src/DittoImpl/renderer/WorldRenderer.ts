import { Camera, OrthographicCamera } from "../_t";
import { BuiltIn_OID } from "@/LF2/defines";
import type { IWorldRenderer } from "@/LF2/ditto/render/IWorldRenderer";
import { is_character, type Entity } from "@/LF2/entity";
import type { LF2 } from "@/LF2/LF2";
import type { World } from "@/LF2/World";
import { Scene } from "../Scene";
import { BgRender } from "./BgRender";
import { EntityInfoRender } from "./EntityInfoRender";
import { EntityRender } from "./EntityRender";
import EntityShadowRender from "./EntityShadowRender";
import { FrameIndicators } from "./FrameIndicators";


export class WorldRenderer implements IWorldRenderer {
  lf2: LF2;
  world: World;
  bg_render: BgRender;
  scene: Scene;
  camera: Camera;
  entity_renderer_packs = new Map<Entity, [
    EntityRender,
    EntityShadowRender | null,
    EntityInfoRender | null,
    FrameIndicators | null
  ]>();

  private _indicator_flags: number = 0;
  get indicator_flags() {
    return this._indicator_flags;
  }
  set indicator_flags(v: number) {
    if (this._indicator_flags === v) return;
    this._indicator_flags = v;
    for (const [, packs] of this.entity_renderer_packs) {
      if (v) {
        if (!packs[3]) packs[3] = new FrameIndicators(packs[0].entity)
        packs[3].flags = v;
      } else {
        if (packs[3]) packs[3].on_unmount();
        packs[3] = null;
      }
    }
  }
  get cam_x(): number {
    return this.camera.position.x
  }
  set cam_x(v: number) {
    this.camera.position.x = v;
    for (const ui of this.lf2.ui_stacks) {
      const [a, b, c] = ui.pos.default_value;
      ui.pos.value = [a + v, b, c];
      ui.renderer.x = v;
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
  add_entity(entity: Entity): void {
    const entity_renderer = new EntityRender(entity);
    entity_renderer.on_mount();

    let info_renderer: EntityInfoRender | null = null
    let shadow_renderer: EntityShadowRender | null = null
    let frame_indicators: FrameIndicators | null = null

    // Criminal...?
    if (is_character(entity) || entity.data.id === BuiltIn_OID.Criminal) {
      info_renderer = new EntityInfoRender(entity, this);
      info_renderer.on_mount()
    }
    frame_indicators = new FrameIndicators(entity);
    frame_indicators.on_mount()
    shadow_renderer = new EntityShadowRender(entity);
    shadow_renderer.on_mount()
    this.entity_renderer_packs.set(entity, [
      entity_renderer, shadow_renderer, info_renderer, frame_indicators
    ]);
  }

  del_entity(e: Entity): void {
    const pack = this.entity_renderer_packs.get(e);
    if (!pack) return;
    const [r1, r2, r3, r4] = pack
    r1.on_unmount();
    r2?.on_unmount();
    r3?.on_unmount();
    r4?.on_unmount();
    this.entity_renderer_packs.delete(e);
  }

  render(dt: number): void {
    const { indicator_flags } = this.world;
    if (indicator_flags != this.indicator_flags)
      this.indicator_flags = indicator_flags;
    this.bg_render.render();
    for (const [, [r1, r2, r3, r4]] of this.entity_renderer_packs) {
      r1.render(dt);
      r2?.render();
      r3?.render();
      r4?.render();
    }
    this.lf2.ui?.renderer.render(dt)
    this.scene.render();
  }

  dispose() {
    this.scene.dispose();
    this.bg_render.release();
  }
}
