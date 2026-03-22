import Callbacks from "./Callbacks";
import { NoEmitCallbacks } from "./NoEmitCallbacks";

export interface IState<K extends string | number = string | number> {
  get key(): K;
  update?(dt: number): K | undefined | void;
  enter?(): void;
  leave?(): void;
}
export interface IFSMCallback<
  K extends string | number = string | number,
  S extends IState<K> = IState<K>,
> {
  on_state_changed?(fsm: IReadonlyFSM<K, S>): void;
}
export interface IReadonlyFSM<
  K extends string | number = string | number,
  S extends IState<K> = IState<K>,
> {
  get callbacks(): NoEmitCallbacks<IFSMCallback<K, S>>;
  get state(): S | undefined;
  get prev_state(): S | undefined;
}
export default class FSM<
  K extends string | number = string | number,
  S extends IState<K> = IState<K>,
> implements IReadonlyFSM<K, S> {
  protected _callbacks = new Callbacks<IFSMCallback<K, S>>();
  protected _state_map = new Map<K, S>();
  protected _prev_state?: S;
  protected _state?: S;
  protected _time: number = 0;
  protected _state_time: number = 0;
  get states(): ReadonlyMap<K, S> { return this._state_map }
  get callbacks(): NoEmitCallbacks<IFSMCallback<K, S>> {
    return this._callbacks;
  }
  get state(): S | undefined {
    return this._state;
  }
  get time(): number { return this._time }
  get state_time(): number { return this._state_time }
  protected set state(s: S | undefined) {
    this._prev_state = this._state;
    this._state?.leave?.();
    this._state = s;
    s?.enter?.();
    this._callbacks.emit("on_state_changed")(this);
  }
  get prev_state(): S | undefined {
    return this._prev_state;
  }
  get(key: K): S | undefined {
    return this._state_map.get(key);
  }
  add(...states: S[]): this {
    for (const state of states) this._state_map.set(state.key, state);
    return this;
  }
  use(key: K): this {
    const next_state = this._state_map.get(key);
    this._state?.leave?.();
    this._state = next_state;
    this._state_time = 0;
    next_state?.enter?.();
    this._callbacks.emit("on_state_changed")(this);
    return this;
  }
  update(dt: number) {
    this._time += dt;
    this._state_time += dt;
    const curr_state = this._state;
    if (!curr_state) return;

    const next_state_key = curr_state.update?.(dt);
    if (next_state_key === void 0 || next_state_key === null) return;

    const next_state = this._state_map.get(next_state_key);
    if (!next_state) return;

    this.state = next_state;
  }
}
