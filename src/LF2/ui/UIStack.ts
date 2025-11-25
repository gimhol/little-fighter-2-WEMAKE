import { Callbacks } from "../base";
import { LF2 } from "../LF2";
import { is_str } from "../utils";
import { ICookedUIInfo } from "./ICookedUIInfo";
import { UINode } from "./UINode";

export interface IUIStacksCallback {
  on_set?(pushed: UINode | undefined, popped: UINode | undefined, stack: UIStack): void;
  on_push?(pushed: UINode | undefined, prev: UINode | undefined, stack: UIStack): void;
  on_pop?(curr: UINode | undefined, poppeds: UINode[], stack: UIStack): void;
}
export class UIStack {
  readonly lf2: LF2;
  readonly uis: UINode[] = [];
  readonly callback = new Callbacks<IUIStacksCallback>;

  get ui(): UINode | undefined {
    return this.uis[this.uis.length - 1];
  }
  constructor(lf2: LF2) {
    this.lf2 = lf2
  }
  dispose(): void {
    this.uis.forEach(ui => {
      ui.on_pause();
      ui.on_stop();
    });
  }

  set(arg: string | ICookedUIInfo | undefined): void {
    if (is_str(arg) && this.ui?.id === arg) return;
    if (!is_str(arg) && this.ui?.id === arg?.id) return;
    const prev = this.uis.pop();
    prev?.on_pause();
    prev?.on_stop();
    const info = is_str(arg)
      ? this.lf2.uiinfos?.find((v) => v.id === arg)
      : arg;
    const curr = info && UINode.create(this.lf2, info);
    curr && this.uis.push(curr);
    curr?.on_start();
    curr?.on_resume();
    if (curr || prev) this.callback.emit('on_set')(curr, prev, this)
  }

  push(arg: string | ICookedUIInfo | undefined): void {
    const prev = this.ui;
    prev?.on_pause();
    const info = is_str(arg)
      ? this.lf2.uiinfos?.find((v) => v.id === arg)
      : arg;
    const curr = info && UINode.create(this.lf2, info);
    curr && this.uis.push(curr);
    curr?.on_start();
    curr?.on_resume();
    this.callback.emit('on_push')(curr, prev, this)
  }

  pop(inclusive?: boolean, until?: (ui: UINode, index: number, stack: UINode[]) => boolean): void {
    const poppeds: UINode[] = []
    const len = this.uis.length
    for (let i = len - 1; i >= 0; --i) {
      const ui = this.uis[i]
      if (until) {
        if (until(ui, i, this.uis)) {
          if (inclusive) {
            poppeds.unshift(ui)
          }
          break;
        }
        poppeds.unshift(ui)
      } else {
        poppeds.unshift(ui);
        break;
      }
    }
    for (let i = 0; i < poppeds.length; i++) {
      const popped = poppeds[i];
      if (i === 0) popped?.on_pause();
      popped?.on_stop();
    }
    this.uis.splice(len - poppeds.length, poppeds.length)
    this.ui?.on_resume();
    this.callback.emit('on_pop')(this.ui, poppeds, this)
  }
}
