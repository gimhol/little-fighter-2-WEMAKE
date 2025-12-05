import type { Entity } from "@/LF2";
import { EntityStatRender } from "./EntityStatRender";
import { EntityRender } from "./EntityRender";
import EntityShadowRender from "./EntityShadowRender";
import { FrameIndicators } from "./FrameIndicators";

export class EntityRenderPack {
  entity: Entity;
  main: EntityRender;
  shad: EntityShadowRender;
  stat?: EntityStatRender;
  indi?: FrameIndicators;

  constructor(e: Entity) {
    this.entity = e;
    this.main = new EntityRender(e);
    this.shad = new EntityShadowRender(e);
  }
  render(dt: number) {
    this.main.render(dt);
    this.shad?.render();
    this.stat?.render();
    this.indi?.render();
  }
  mount() {
    this.main.on_mount();
    this.shad?.on_mount();
    this.stat?.on_mount();
    this.indi?.on_mount();
  }
  unmount() {
    this.main.on_unmount();
    this.shad?.on_unmount();
    this.stat?.on_unmount();
    this.indi?.on_unmount();
  }
}
