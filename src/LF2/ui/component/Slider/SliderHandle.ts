import { clamp, Defines, GK, IPointingEvent, IPointingsCallback, ISchema, IUICallback, IUICompnentCallbacks, IUIKeyEvent, LF2PointerEvent, make_schema, round_float, UIComponent, UINode } from "@/LF2";
export interface ISliderHandleProps {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  container?: UINode;
  responser?: UINode;
}
export interface ISliderHandleCallbacks extends IUICompnentCallbacks {
  on_value_changed?(value: number, component: SliderHandle): void
}
export class SliderHandle extends UIComponent<ISliderHandleProps, ISliderHandleCallbacks> {
  static override readonly TAGS: string[] = ["SliderHandle"];
  static override PROPS: ISchema<ISliderHandleProps> = make_schema<ISliderHandleProps>({
    key: "ISliderHandleProps", type: "object", properties: {
      min: Number,
      max: Number,
      precision: Number,
      step: Number,
      container: UINode,
      responser: UINode,
    }
  });
  private _on_me = false;
  private _factor: number = 0;
  private p: IUICallback = {
    on_pointer_down: (e: LF2PointerEvent): void => {
      const { container } = this;
      if (!container) return;
      container.focused = true
      this._on_me = true
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
      this._on_me = false
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
  set factor(v: number) { this._factor = clamp(v, 0, 1) }
  get value(): number {
    const { min_value, max_value, precision } = this;
    return round_float(min_value + (max_value - min_value) * this.factor, precision)
  }
  set value(v: number) {
    const { min_value, max_value } = this;
    v = clamp(v, min_value, max_value);
    this._factor = (v - min_value) / (max_value - min_value)
  }
  handle_pointing_event(e: IPointingEvent): void {
    const { container } = this;
    if (!container) return;
    const fx = Defines.MODERN_SCREEN_WIDTH * (e.scene_x + 1) / 2
    const { geo } = container;
    const { cross } = this.node;
    const min_x = geo.left - geo.pos.x - cross.left;
    const max_x = geo.right - geo.pos.x - cross.right;
    const x = clamp(fx - geo.pos.x, min_x, max_x);
    this.factor = (x - min_x) / (max_x - min_x);
    this.value = this.value
    this.callbacks.emit('on_value_changed')(this.value, this)
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
    const { container } = this;
    if (!container) return;
    const { cross } = this.node;
    const { geo } = container;
    const min_x = geo.left - geo.pos.x - cross.left;
    const max_x = geo.right - geo.pos.x - cross.right;
    const x = min_x + (max_x - min_x) * this.factor;
    this.node.x = round_float(this.node.x + (x - this.node.x) * 0.5);
  }
  override on_key_up(e: IUIKeyEvent): void {
    if (!this.responser?.focused) return;
    if (e.game_key === GK.Left) {
      this.value -= this.step;
    }
    if (e.game_key === GK.R) {
      this.value += this.step;
    }
  }
}