export interface IWork {
  (): unknown;
}
export interface IAction {
  time: number;
  work: IWork
}
export class ActionDirector {

  private _action_idx = 0;
  private _actions: IAction[] = [];
  private _time: number = 0;
  private _times: number = 1;
  private _curr: number = 0;
  get time() { return this._time; }
  reset(): this {
    this._time = 0;
    this._curr = 0;
    this._action_idx = 0;
    return this;
  }
  get end_time() {
    return this._actions.at(this._actions.length - 1)?.time ?? 0
  }
  repeat(times: number, offset: number, ...works: IWork[]): this {
    let time = this.end_time
    while (times >= 0) {
      for (const work of works) {
        time += offset
        this._actions.push({ time, work });
      }
      --times;
    }
    return this;
  }
  offset(offset: number, ...works: IWork[]): this {
    let time = this.end_time
    for (const work of works) {
      time += offset;
      this._actions.push({ time, work });
    }
    return this;
  }
  add(time: number, work: IWork): this {
    this._actions.push({ time, work });
    return this;
  }
  wait(time: number) {
    this._actions.push({ time: this.end_time + time, work() { } });
    return this;
  }
  sort(): this {
    this._actions.sort((a, b) => a.time > b.time ? 1 : -1);
    return this;
  }
  update(dt: number) {
    const { end_time = 0 } = this;
    const time = end_time ? this._time % end_time : this._time;

    if (this._action_idx === this._actions.length && this._curr < this._times) {
      this._action_idx = 0;
      ++this._curr;
    } else {
      const actions: IAction[] = [];
      for (; this._action_idx < this._actions.length; ++this._action_idx) {
        const action = this._actions[this._action_idx];
        if (action.time > time) break;
        actions.push(action);
      }
      actions.forEach(v => v.work());
    }

    this._time += dt;
  }
  times(times: number) {
    this._times = times
    return this;
  }
}
