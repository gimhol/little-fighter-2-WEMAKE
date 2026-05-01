import type { Entity } from "@/LF2";
import { EntityCtrlRender } from "./EntityCtrlRender";
import { EntityMainRender } from "./EntityMainRender";
import { EntityNameRender } from "./EntityNameRender";
import { EntityShadowRender } from "./EntityShadowRender";
import { EntityStatRender } from "./EntityStatRender";
import { FrameIndicators } from "./FrameIndicators";
import type { WorldRenderer } from "./WorldRenderer";

export class EntityRenderer {
  update_id = -1;
  entity!: Entity;
  main!: EntityMainRender;
  name!: EntityNameRender;
  shad!: EntityShadowRender;
  stat: EntityStatRender | null = null;
  indi: FrameIndicators | null = null;
  ctrl: EntityCtrlRender | null = null;

  constructor(e: Entity) {
    this.reset(e);
  }
  reset(e: Entity) {
    this.entity = e;
    this.main = new EntityMainRender(e);
    this.shad = new EntityShadowRender(e);
    this.name = new EntityNameRender(e, e.world.renderer as WorldRenderer);
    this.stat?.on_unmount();
    this.indi?.on_unmount();
    this.ctrl?.on_unmount();
    this.stat = null
    this.indi = null
    this.ctrl = null
  }
  render(dt: number) {
    const update_id = this.entity.update_id.value
    if (this.update_id === update_id) return;
    this.update_id = update_id;
    this.main.render(dt);
    this.name.render();
    this.shad.render();
    this.stat?.render();
    this.indi?.render();
    this.ctrl?.render()
  }
  mount() {
    this.main.on_mount();
    this.name.on_mount();
    this.shad.on_mount();
    this.stat?.on_mount();
    this.indi?.on_mount();
    this.ctrl?.on_mount()
  }
  unmount() {
    this.main.on_unmount();
    this.name.on_unmount();
    this.shad.on_unmount();
    this.stat?.on_unmount();
    this.indi?.on_unmount();
    this.ctrl?.on_unmount();
    this.stat = null
    this.indi = null
    this.ctrl = null
  }
}
