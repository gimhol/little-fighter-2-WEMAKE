import type { Entity } from "@/LF2";
import { EntityRender } from "./EntityRender";
import EntityShadowRender from "./EntityShadowRender";
import { EntityStatRender } from "./EntityStatRender";
import { FrameIndicators } from "./FrameIndicators";

export class EntityRenderer {
  update_id = -1;
  entity!: Entity;
  main!: EntityRender;
  shad!: EntityShadowRender;
  stat!: EntityStatRender | null;
  indi!: FrameIndicators | null;

  constructor(e: Entity) {
    this.reset(e);
  }
  reset(e: Entity) {
    this.entity = e;
    this.main = new EntityRender(e);
    this.shad = new EntityShadowRender(e);
  }
  render(dt: number) {
    const update_id = this.entity.update_id.value
    if (this.update_id === update_id) return;
    this.update_id = update_id;
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
