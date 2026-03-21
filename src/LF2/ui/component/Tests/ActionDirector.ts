export interface IAction {
  time: number;
  work: () => unknown
}
export class ActionDirector {
  private _action_idx = 0;
  private _actions: IAction[] = [];
  private _time: number = 0;
  get time() { return this._time; }
  reset(): this {
    this._time = 0;
    this._action_idx = 0;
    return this;
  }
  offset(offset: number, ...works: (() => unknown)[]): this {
    let time = this._actions.at(this._actions.length - 1)?.time ?? 0
    works.forEach((work, idx) => {
      this._actions.push({ time: time + offset * idx, work });
    })
    return this;
  }
  add(time: number, work: () => unknown): this {
    this._actions.push({ time, work });
    return this;
  }
  sort(): this {
    this._actions.sort((a, b) => a.time > b.time ? 1 : -1);
    return this;
  }
  update(dt: number) {
    const actions: IAction[] = [];
    for (; this._action_idx < this._actions.length; ++this._action_idx) {
      const action = this._actions[this._action_idx];
      if (action.time > this._time)
        break;
      actions.push(action);
    }
    actions.forEach(v => v.work());
    this._time += dt;
  }
}
