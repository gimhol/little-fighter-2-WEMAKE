import { UIComponent } from "./UIComponent";

export abstract class ComponentFSMState<K extends string | number = string | number, C extends UIComponent = UIComponent> {
  readonly owner: C;
  abstract key: K;
  get lf2() { return this.owner.lf2; }
  get world() { return this.owner.world; }
  get node() { return this.owner.node; }
  constructor(owner: C) { this.owner = owner; }
  enter?(): void;
  update?(dt: number): K | void | undefined;
  leave?(): void;
}
