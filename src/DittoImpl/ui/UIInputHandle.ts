import * as T from "three";
import type { IPointingEvent } from "../../LF2/ditto/pointings";
import { IUIInputHandle } from "../../LF2/ditto/ui/IEventHandle";
import type { LF2 } from "../../LF2/LF2";
import { LF2PointerEvent } from "../../LF2/ui/LF2PointerEvent";
import { UINode } from "../../LF2/ui/UINode";
import { UINodeRenderer } from "../renderer/UINodeRenderer";
import { WorldRenderer } from "../renderer/WorldRenderer";
interface IIntersection {
  extra: UINode;
  point: T.Vector3;
}
export class UIInputHandle implements IUIInputHandle {
  private lf2: LF2;
  private pointer_vec_2 = new T.Vector2();
  private pointer_raycaster = new T.Raycaster();
  private world_renderer: WorldRenderer
  private _pointer_down_uis = new Set<UINode>();
  private _pointer_on_uis = new Set<UINode>();
  constructor(lf2: LF2) {
    this.lf2 = lf2;
    this.world_renderer = this.lf2.world.renderer as WorldRenderer
  }

  on_pointer_down(e: IPointingEvent) {
    const { ui } = this.lf2; if (!ui) return;
    const intersections = this.intersections(e.scene_x, e.scene_y, ui);
    for (const i of intersections) {
      this._pointer_down_uis.add(i.extra)
      const e = new LF2PointerEvent(i.point);
      i.extra.on_pointer_down(e);
      if (e.stopped) break;
    }
  }
  on_pointer_move(e: IPointingEvent) {
    const { ui } = this.lf2; if (!ui) return;
    const intersections = this.intersections(e.scene_x, e.scene_y, ui);
    const leave_ui = this._pointer_on_uis;
    const stay_ui = new Set<UINode>();
    const enter_ui = new Set<UINode>();
    for (const { extra: ui } of intersections) {
      if (leave_ui.has(ui)) {
        leave_ui.delete(ui)
        stay_ui.add(ui)
      } else {
        enter_ui.add(ui);
      }
    }
    for (const ui of leave_ui) {
      ui.on_pointer_leave();
    }
    this._pointer_on_uis.clear();
    for (const ui of enter_ui) {
      ui.on_pointer_enter();
      this._pointer_on_uis.add(ui)
    }
    for (const ui of stay_ui) {
      this._pointer_on_uis.add(ui)
    }
  }
  on_pointer_up(e: IPointingEvent) {
    const { ui } = this.lf2; if (!ui) return;
    const intersections = this.intersections(e.scene_x, e.scene_y, ui);
    for (const i of intersections) {
      if (i.extra.pointer_down) {
        this._pointer_down_uis.delete(i.extra)
        const e = new LF2PointerEvent(i.point);
        i.extra.on_pointer_up(e);
        if (e.stopped) break;
      }
    }
    for (const i of intersections) {
      if (i.extra.click_flag) {
        const e = new LF2PointerEvent(i.point);
        i.extra.on_click(e);
        if (e.stopped) break;
      }
    }
    for (const i of this._pointer_down_uis) {
      const e = new LF2PointerEvent(new T.Vector3(NaN, NaN, NaN));
      i.on_pointer_cancel(e);
    }
    this._pointer_down_uis.clear()
  }
  on_pointer_cancel(e: IPointingEvent) {
    for (const i of this._pointer_down_uis) {
      const e = new LF2PointerEvent(new T.Vector3(NaN, NaN, NaN));
      i.on_pointer_cancel(e);
    }
    this._pointer_down_uis.clear()
  }
  on_click(e: IPointingEvent): void {
    // throw new Error("Method not implemented.");
  }

  protected intersections(x: number, y: number, ui: UINode): IIntersection[] {
    this.pointer_vec_2.x = x;
    this.pointer_vec_2.y = y;
    this.pointer_raycaster.setFromCamera(this.pointer_vec_2, this.world_renderer.camera);
    const ui_sprite = (ui.renderer as UINodeRenderer).sprite

    const ret: IIntersection[] = [];
    const temp = this.pointer_raycaster.intersectObject(ui_sprite);
    temp.sort((a, b) => a.distance - b.distance)

    for (const t of temp) {
      const ui = t.object.userData.owner;
      if (!(ui instanceof UINode)) continue;
      if (!ui.visible || ui.disabled) continue;
      const item = { extra: ui, point: t.point }
      ret.push(item);
    }
    return ret;
  }
}
