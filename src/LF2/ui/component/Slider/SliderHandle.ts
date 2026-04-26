import { clamp, Defines, GameKey, GK, IPointingEvent, IPointingsCallback, IPropsMeta, IUICallback, IUICompnentCallbacks, IUIKeyEvent, KeyStatus, Label, LF2PointerEvent, round_float, UIComponent, UINode } from "@/LF2";
export interface ISliderHandleProps {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  container?: UINode;
  responser?: UINode;
  handle_label?: Label;
  items?: string;
  direction?: 'row' | 'col';
  switcher?: boolean;
}
export interface ISliderHandleCallbacks extends IUICompnentCallbacks {
  on_value_changed?(value: number, component: SliderHandle): void
}
export class SliderHandle extends UIComponent<ISliderHandleProps, ISliderHandleCallbacks> {
  static override readonly TAGS: string[] = ["SliderHandle"];
  static override readonly PROPS: IPropsMeta<ISliderHandleProps> = {
    min: Number,
    max: Number,
    precision: Number,
    step: Number,
    container: UINode,
    responser: UINode,
    handle_label: Label,
    items: String,
    switcher: Boolean,
    direction: { type: String, oneof: ["row", "col"], nullable: true }
  }
  time: number = 0;
  readonly keys: Record<GameKey, KeyStatus> = {
    [GameKey.L]: new KeyStatus(this),
    [GameKey.R]: new KeyStatus(this),
    [GameKey.U]: new KeyStatus(this),
    [GameKey.D]: new KeyStatus(this),
    [GameKey.a]: new KeyStatus(this),
    [GameKey.j]: new KeyStatus(this),
    [GameKey.d]: new KeyStatus(this)
  };
  get direction() { return this.props.direction ?? 'row' }
  get lr() {
    const r = this.keys.R.is_end() ? 0 : 1;
    const l = this.keys.L.is_end() ? 0 : 1;
    return r - l;
  }
  get ud() {
    const u = this.keys.U.is_end() ? 0 : 1;
    const d = this.keys.D.is_end() ? 0 : 1;
    return u - d;
  }
  private _on_me = false;
  private _factor: number = 0;
  private p: IUICallback = {
    on_pointer_down: (e: LF2PointerEvent): void => {
      const { container, responser } = this;
      if (responser) responser.focused = true
      else if (container) container.focused = true
      else return;
      const { min_value, max_value, precision, step } = this;
      if (min_value == 0 && max_value == 1 && precision == 1 && step == 1) {
        this.factor = this._factor ? 0 : 1;
        this.callbacks.emit('on_value_changed')(this.value, this)
      } else {
        this._on_me = true
      }
    }
  }
  private b: IPointingsCallback = {
    on_pointer_down: (e: IPointingEvent): void => {
      if (!this._on_me) return;
      this.handle_pointing_event(e);
    },
    on_pointer_move: (e: IPointingEvent): void => {
      if (!this._on_me) return;
      this.handle_pointing_event(e);
    },
    on_pointer_up: (e: IPointingEvent): void => {
      if (!this._on_me) return;
      this.handle_pointing_event(e);
      this.callbacks.emit('on_value_changed')(this.value, this)
      this._on_me = false;
    },
    on_pointer_cancel: (e) => {
      if (!this._on_me) return;
      this.callbacks.emit('on_value_changed')(this.value, this)
      this._on_me = false;
    },
  }
  get container(): UINode | undefined {
    return this.props.container ?? this.node.parent;
  }
  get responser(): UINode | undefined {
    return this.props.responser ?? this.container;
  }
  get step(): number { return this.props.step ?? 10 }
  get precision(): number { return this.props.precision ?? 1 }
  get min_value(): number { return this.props.min ?? 0 }
  get max_value(): number { return this.props.max ?? 100 }
  get factor(): number { return clamp(this._factor, 0, 1) }
  set factor(v: number) { this.set_factor(v) }
  set_factor(v: number): this {
    this._factor = clamp(v, 0, 1);
    const { min_value, precision, step } = this;
    if (min_value == 0 && precision == 1 && step == 1) {
      const items = this.props.items?.split(',')
      if (items?.length) {
        this.props.handle_label?.set_text('' + (items.at(this.value) ?? this.value))
      } else {
        this.props.handle_label?.set_text('' + this.value)
      }
    } else {
      this.props.handle_label?.set_text('' + this.value)
    }
    return this;
  }
  get value(): number {
    const { min_value, max_value, precision } = this;
    return round_float(min_value + (max_value - min_value) * this._factor, precision)
  }
  set value(v: number) { this.set_value(v) }
  set_value(v: number): this {
    const { min_value, max_value, precision } = this;
    v = round_float(clamp(v, min_value, max_value), precision);
    this.factor = round_float((v - min_value) / (max_value - min_value));
    return this;
  }
  handle_pointing_event(e: IPointingEvent): void {
    const { container } = this;
    if (!container) return;
    const { geo } = container;
    const { cross } = this.node;
    if (this.direction == 'row') {
      const fx = Defines.MODERN_SCREEN_WIDTH * (e.scene_x + 1) / 2
      const min_num = geo.left - geo.pos.x - cross.left;
      const max_num = geo.right - geo.pos.x - cross.right;
      const x = clamp(fx - geo.pos.x, min_num, max_num);
      this.factor = round_float((x - min_num) / (max_num - min_num));
      this.value = this.value
    } else {
      const fy = Defines.MODERN_SCREEN_HEIGHT * (1 - e.scene_y) / 2
      const min_num = geo.top - geo.pos.y - cross.top;
      const max_num = geo.bottom - geo.pos.y - cross.bottom;
      const y = clamp(fy - geo.pos.y, min_num, max_num);
      this.factor = round_float((y - min_num) / (max_num - min_num));
      this.value = this.value // 懒了，直接用这个来“弹”
    }
  }
  override on_start(): void {
    this.container?.callbacks.add(this.p)
    this.lf2.pointings.callback.add(this.b)
  }
  override on_stop(): void {
    this.container?.callbacks.del(this.p)
    this.lf2.pointings.callback.del(this.b)
  }
  override update(dt: number): void {
    this.time += dt;
    const { container, responser } = this;
    if (!container) return;
    const { cross } = this.node;
    const { geo } = container;
    if (this.direction == 'row') {
      const min_num = geo.left - geo.pos.x - cross.left;
      const max_num = geo.right - geo.pos.x - cross.right;
      const x = min_num + (max_num - min_num) * this.factor;
      this.node.x = round_float(this.node.x + (x - this.node.x) * 0.25);
    } else {
      const min_num = geo.top - geo.pos.y - cross.top;
      const max_num = geo.bottom - geo.pos.y - cross.bottom;
      const y = min_num + (max_num - min_num) * this.factor;
      this.node.y = round_float(this.node.y + (y - this.node.y) * 0.25);
    }
    if (
      !responser?.focused &&
      !container?.focused &&
      !this.node?.focused
    ) return;
    if (!this.props.switcher) {
      const { lr, ud } = this;
      if (this.direction == 'row' && lr) {
        this.value += this.step * lr;
      } else if (this.direction == 'col' && ud) {
        this.value -= this.step * ud;
      }
    }
  }
  override on_key_down(e: IUIKeyEvent): void {
    this.keys[e.game_key].hit();
  }
  override on_key_up(e: IUIKeyEvent): void {
    if (
      !this.responser?.focused &&
      !this.container?.focused &&
      !this.node?.focused
    ) {
      this.keys[e.game_key].end();
      return;
    }
    if (this.props.switcher) {
      const { lr, ud } = this;
      if (this.direction == 'row' && lr) {
        const prev = this.value
        let curr = this.value + this.step * lr
        if (curr < this.min_value) curr = this.max_value;
        if (curr > this.max_value) curr = this.min_value;
        this.value = curr;
        if (prev != curr) 
          this.callbacks.emit('on_value_changed')(this.value, this)
      } else if (this.direction == 'col' && ud) {
        const prev = this.value
        let curr = this.value - this.step * ud
        if (curr < this.min_value) curr = this.max_value;
        if (curr > this.max_value) curr = this.min_value;
        this.value = curr;
        if (prev != curr) 
          this.callbacks.emit('on_value_changed')(this.value, this)
      }
    }
    this.keys[e.game_key].end();
  }
}