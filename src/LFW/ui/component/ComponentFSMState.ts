import type { LFW } from "../../LFW";
import type { World } from "../../World";
import type { UINode } from "../UINode";
import type { UIComponent } from "./UIComponent";

export abstract class ComponentFSMState<K extends string | number = string | number, C extends UIComponent = UIComponent> {
  readonly owner: C;
  readonly lfw: LFW
  readonly world: World;
  readonly node: UINode;
  abstract key: K;
  name?: string;
  constructor(owner: C) {
    this.owner = owner;
    this.lfw = owner.lfw;
    this.world = owner.world;
    this.node = owner.node;
  }
  enter?(): void;
  update?(dt: number): K | void | undefined;
  leave?(): void;
}
