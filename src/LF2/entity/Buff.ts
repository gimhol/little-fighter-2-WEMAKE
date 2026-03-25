import { new_id } from "../base";
import { Times } from "../utils";
import { Entity } from "./Entity";

export class Buff {
  private _id: string;
  private _targets = new Set<Entity>();
  private _tick = new Times();
  private _life = new Times(0, 1).set_lifes(1);
  job = () => { }
  get tick() { return this._tick }
  get life() { return this._life }
  get dead() { return this._life.remains == 0 }
  get targets(): ReadonlySet<Entity> { return this._targets }
  get id(): string { return this._id }
  constructor(id: string = new_id()) {
    this._id = id;
  }
  add(...targets: Entity[]): this {
    for (const target of targets) {
      this._targets.add(target)
      target.buff.set(this._id, this)
    }
    return this;
  }
  del(...targets: Entity[]): this {
    for (const target of targets) {
      this._targets.delete(target)
      target.buff.delete(this._id)
    }
    return this;
  }
  update() {
    if (this._tick.add()) this.job();
    this._life.add()
  }
  unmount() {
    for (const target of this.targets) {
      this._targets.delete(target)
      target.buff.delete(this._id)
    }
    this._targets.clear();
  }
}