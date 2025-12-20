import { GameKey } from "../../defines/GameKey";
import { max } from "../../utils/math/base";
import { IUIKeyEvent } from "../IUIKeyEvent";
import type { UINode } from "../UINode";
import { Times } from "../utils";
import { Reachable } from "./Reachable";
import { UIComponent } from "./UIComponent";

export class ReachableGroup extends UIComponent {
  static override readonly TAG = 'ReachableGroup'
  protected reachables: Reachable[] = [];

  get name(): string { return this.args[0] || ""; }
  get direction(): string { return this.args[1] || ""; }
  get binded_layout(): UINode {
    const lid = this.args[2];
    if (!lid) return this.node;
    return this.node.root.find_child(lid) || this.node;
  }
  override on_start(): void {
    this.reachables = this.node.root.search_components(Reachable, (v) => v.group_name === this.name)
    if (this.direction === "lr") {
      this.reachables.sort((a, b) => a.node.global_pos[0] - b.node.global_pos[0]);
    } else if (this.direction === "ud") {
      this.reachables.sort((a, b) => a.node.global_pos[1] - b.node.global_pos[1]);
    }

  }
  override on_key_down(e: IUIKeyEvent): void {
    const { game_key: key } = e;
    if (!this.binded_layout.visible) return;
    if (this.binded_layout.disabled) return;
    switch (this.direction) {
      case "lr": if (key === "L" || key === "R") break; else return;
      case "ud": if (key === "U" || key === "D") break; else return;
      default: return;
    }
    if (key === "L" || key === "U") {
      this.focus_prev()
    } else if (key === "R" || key === "D") {
      this.focus_next()
    }
  }
  focus_prev() {
    const items = this.reachables.filter(v => v.node.visible && !v.node.disabled)
    if (items.length <= 0) return;
    const focused_layout = this.node.focused_node;
    const idx = items.findIndex((v) => v.node === focused_layout);
    const next_idx = (max(idx, 0) + items.length - 1) % items.length;
    items[next_idx]!.node.focused = true;
  }
  focus_next() {
    const items = this.reachables.filter(v => v.node.visible && !v.node.disabled)
    if (items.length <= 0) return;
    const focused_layout = this.node.focused_node;
    const idx = items.findIndex((v) => v.node === focused_layout);
    const next_idx = (idx + 1) % items.length;
    items[next_idx]!.node.focused = true;
  }
  times = new Times(0, 10)
  override update(dt: number): void {
    super.update?.(dt);
    for (const [k, player] of this.lf2.players) {
      if (player.ctrl <= 0) continue;
      const { direction } = this
      const [ax = 0, ay = 0] = this.lf2.keyboard.axes(player.ctrl - 1)
      const vv = direction === 'lr' ? ax : ay
      if (vv > 0.22) {
        if (this.times.add()) {
          this.focus_next()
        }
      } else if (vv < -0.22) {
        if (this.times.add()) {
          this.focus_prev()
        }
      } else { 
        this.times.end() 
      }
    }
  }
}
