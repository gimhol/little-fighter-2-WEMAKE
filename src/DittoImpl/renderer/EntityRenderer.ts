import { BuiltIn_OID, is_fighter, type Entity } from "@/LF2";
import { EntityCtrlRender } from "./EntityCtrlRender";
import { EntityMainRender } from "./EntityMainRender";
import { EntityNameRender } from "./EntityNameRender";
import { EntityShadowRender } from "./EntityShadowRender";
import { EntityStatRender } from "./EntityStatRender";
import { FrameIndicators } from "./FrameIndicators";
import { INDICATINGS } from "./INDICATINGS";
import type { WorldRenderer } from "./WorldRenderer";

export class EntityRenderer {
  update_id = -1;
  entity: Entity;
  main: EntityMainRender;
  name: EntityNameRender;
  shad: EntityShadowRender;
  stat: EntityStatRender | null = null;
  indi: FrameIndicators | null = null;
  ctrl: EntityCtrlRender | null = null;
  readonly world_renderer: WorldRenderer;
  protected _indicators: number = 0;

  constructor(e: Entity) {
    this.world_renderer = e.world.renderer as WorldRenderer
    this._indicators = this.world_renderer.indicators
    this.entity = e;
    this.main = new EntityMainRender(e);
    this.shad = new EntityShadowRender(e, this.world_renderer);
    this.name = new EntityNameRender(e, this.world_renderer);
  }
  ensure_ctrl() {
    if (!this.ctrl && this._indicators & INDICATINGS.ctrl) {
      this.ctrl = new EntityCtrlRender(this.entity, this.world_renderer)
      this.ctrl.on_mount();
    } else if (this.ctrl) {
      this.ctrl.on_unmount();
      this.ctrl = null;
    }
  }
  ensure_stat() {
    // Criminal...?
    if (
      is_fighter(this.entity) ||
      this.entity.data.id === BuiltIn_OID.Criminal
    ) {
      if (!this.stat) {
        this.stat = new EntityStatRender(this.entity, this.world_renderer);
        this.stat.on_mount()
      }
    } else if (this.stat) {
      this.stat.on_unmount();
      this.stat = null
    }
  }
  ensure_indi() {
    if (this._indicators ^ INDICATINGS.ctrl) {
      if (!this.indi) this.indi = new FrameIndicators(this.entity);
      this.indi.flags = this._indicators
    } else if (this.indi) {
      this.indi.on_unmount();
      this.indi = null
    }
  }
  render(dt: number) {
    if (this._indicators !== this.world_renderer.indicators) {
      this._indicators = this.world_renderer.indicators
      this.ensure_indi()
      this.ensure_ctrl()
    }
    this.main.render(dt);
    this.shad.render();
    const update_id = this.entity.lifetime
    if (this.update_id === update_id) return;
    this.update_id = update_id;
    this.name.render();
    this.stat?.render();
    this.indi?.render();
    this.ctrl?.render()
  }
  mount() {
    this.main.on_mount();
    this.name.on_mount();
    this.shad.on_mount();
    this.ensure_stat()
    this.ensure_indi()
    this.ensure_ctrl()
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
