
import { Entity, IEntityCallbacks } from "@/LF2/entity";
import { UINode } from "../UINode";
import { UIComponent } from "./UIComponent";
import { abs, float_equal } from "@/LF2/utils";
class SmoothNumber {
  private _v: number = 0;
  private _t: number = 0;
  private _c?: () => void
  factor = 0.3;
  min_diff = 1;
  done: boolean = false;
  get value(): number { return this._v }
  set value(v: number) { this._t = v; this.done = false }

  on_change(v: () => void) {
    this._c = v;
    return this;
  }
  update() {
    if (this.done || float_equal(this._t, this._v)) {
      this.done = true
      return;
    }
    this._v = this._v + this.factor * (this._t - this._v)
    if (abs(this._v - this._t) < this.min_diff) {
      this.done = true;
      this._v = this._t
    }
    this._c?.();
  }
}
export class FighterStatBar extends UIComponent {
  static override readonly TAG: string = 'FighterStatBar';
  protected dark_hp_bar?: UINode;
  protected hp_bar?: UINode;
  protected dark_mp_bar?: UINode;
  protected mp_bar?: UINode;
  protected fall_value_bar?: UINode;
  protected defend_value_bar?: UINode;
  protected toughness_bar?: UINode;
  protected entity?: Entity;

  protected defend_value_max = new SmoothNumber().on_change(() => this.update_defend_value())
  protected defend_value = new SmoothNumber().on_change(() => this.update_defend_value())
  protected fall_value_max = new SmoothNumber().on_change(() => this.update_fall_value())
  protected fall_value = new SmoothNumber().on_change(() => this.update_fall_value())
  protected toughness = new SmoothNumber().on_change(() => this.update_toughness())
  protected toughness_max = new SmoothNumber().on_change(() => this.update_toughness())
  protected hp_max = new SmoothNumber().on_change(() => { this.update_hp(); this.update_hp_r() })
  protected hp_r = new SmoothNumber().on_change(() => this.update_hp_r())
  protected hp = new SmoothNumber().on_change(() => this.update_hp())
  protected mp_max = new SmoothNumber().on_change(() => this.update_mp())
  protected mp = new SmoothNumber().on_change(() => this.update_mp())

  protected dark_hp_bar_w: number = 200;
  protected hp_bar_w: number = 200;
  protected dark_mp_bar_w: number = 200;
  protected mp_bar_w: number = 200;
  protected fall_value_bar_w: number = 200;
  protected defend_value_bar_w: number = 200;
  protected toughness_bar_w: number = 200;
  protected cbs: IEntityCallbacks = {
    on_hp_max_changed: (_, v) => { this.hp_max.value = v; },
    on_hp_r_changed: (e, v) => {
      this.hp_r.value = v;
      if (e.hp <= 0) this.hp_r.value = 0;
    },
    on_hp_changed: (_, v) => {
      this.hp.value = v;
      if (v <= 0) this.hp_r.value = 0;
    },
    on_mp_max_changed: (_, v) => { this.mp_max.value = v; },
    on_mp_changed: (_, v) => { this.mp.value = v; },
    on_defend_value_max_changed: (_, v) => { this.defend_value_max.value = v; },
    on_defend_value_changed: (_, v) => { this.defend_value.value = v; },
    on_fall_value_max_changed: (_, v) => { this.fall_value_max.value = v; },
    on_fall_value_changed: (_, v) => { this.fall_value.value = v; },
    on_toughness_max_changed: (_, v) => { this.toughness_max.value = v; },
    on_toughness_changed: (_, v) => { this.toughness.value = v; },
  }
  set_entity(entity: Entity | undefined) {
    if (this.entity === entity) return;
    this.entity?.callbacks.del(this.cbs)
    this.entity = entity
    if (entity) {
      this.hp_max.value = entity.hp_max
      this.hp_r.value = entity.hp_r
      this.hp.value = entity.hp
      this.mp_max.value = entity.mp_max
      this.mp.value = entity.mp
      this.defend_value_max.value = entity.defend_value_max
      this.defend_value.value = entity.defend_value
      this.fall_value_max.value = entity.fall_value_max
      this.fall_value.value = entity.fall_value
      this.toughness_max.value = entity.toughness_max || 1
      this.toughness.value = entity.toughness
      entity.callbacks.add(this.cbs)
    }
  }
  override on_start(): void {
    super.on_start?.();
    this.dark_hp_bar = this.node.find_child(this.props.str('dark_hp_bar')!)
    this.hp_bar = this.node.find_child(this.props.str('hp_bar')!)
    this.dark_mp_bar = this.node.find_child(this.props.str('dark_mp_bar')!)
    this.mp_bar = this.node.find_child(this.props.str('mp_bar')!)
    this.fall_value_bar = this.node.find_child(this.props.str('fall_value_bar')!)
    this.defend_value_bar = this.node.find_child(this.props.str('defend_value_bar')!)
    this.toughness_bar = this.node.find_child(this.props.str('toughness_bar')!)

    if (this.dark_hp_bar) this.dark_hp_bar_w = this.dark_hp_bar.size.value[0]
    if (this.hp_bar) this.hp_bar_w = this.hp_bar.size.value[0]
    if (this.dark_mp_bar) this.dark_mp_bar_w = this.dark_mp_bar.size.value[0]
    if (this.mp_bar) this.mp_bar_w = this.mp_bar.size.value[0]
    if (this.fall_value_bar) this.fall_value_bar_w = this.fall_value_bar.size.value[0]
    if (this.defend_value_bar) this.defend_value_bar_w = this.defend_value_bar.size.value[0]
    if (this.toughness_bar) this.toughness_bar_w = this.toughness_bar.size.value[0]
  }
  update_defend_value(val = this.defend_value.value, max = this.defend_value_max.value) {
    const node = this.defend_value_bar;
    if (!node || max === 0) return;
    const ww = this.defend_value_bar_w
    const w = ww * val / max;
    const h = node.size.value[1];
    node.size.value = [w, h]
  }
  update_fall_value(val = this.fall_value.value, max = this.fall_value_max.value) {
    const node = this.fall_value_bar;
    if (!node || max === 0) return;
    const ww = this.fall_value_bar_w
    const w = ww * val / max;
    const h = node.size.value[1];
    node.size.value = [w, h]
  }
  update_toughness(val = this.toughness.value, max = this.toughness_max.value) {
    const node = this.toughness_bar;
    if (!node || max === 0) return;
    const ww = this.toughness_bar_w
    const w = ww * val / max;
    const h = node.size.value[1];
    node.size.value = [w, h]
  }
  update_hp(val = this.hp.value, max = this.hp_max.value) {
    const node = this.hp_bar;
    if (!node || max === 0) return;
    const ww = this.hp_bar_w
    const w = ww * val / max;
    const h = node.size.value[1];
    node.size.value = [w, h]
  }
  update_hp_r(val = this.hp_r.value, max = this.hp_max.value) {
    const node = this.dark_hp_bar;
    if (!node || max === 0) return;
    const ww = this.dark_hp_bar_w
    const w = ww * val / max;
    const h = node.size.value[1];
    node.size.value = [w, h]
  }
  update_mp(val = this.mp.value, max = this.mp_max.value) {
    const node = this.mp_bar;
    if (!node || max === 0) return;
    const ww = this.mp_bar_w
    const w = ww * val / max;
    const h = node.size.value[1];
    node.size.value = [w, h]
  }
  override update(): void {
    this.defend_value_max.update()
    this.defend_value.update()
    this.fall_value_max.update()
    this.fall_value.update()
    this.toughness.update()
    this.toughness_max.update()
    this.hp_max.update()
    this.hp_r.update()
    this.hp.update()
    this.mp_max.update()
    this.mp.update()
  }
}
