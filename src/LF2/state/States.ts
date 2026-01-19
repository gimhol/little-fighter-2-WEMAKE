import { EntityEnum, TEntityEnum } from "../defines";
import BallState_Base from "./BallState_Base";
import CharacterState_Base from "./CharacterState_Base";
import State_Base from "./State_Base";
import WeaponState_Base from "./WeaponState_Base";

export class States {
  readonly map = new Map<number | string, State_Base>();

  get(key: number | string) {
    return this.map.get(key);
  }

  set(key: number | string, value: State_Base) {
    if (this.map.has(key)) debugger;
    this.map.set(key, value);
  }
  add(...values: State_Base[]): this {
    for (const value of values) {
    if (this.map.has(value.state)) debugger;
      this.map.set(value.state, value);
    }
    return this;
  }
  set_in_range(from: number, to: number, create: (key: number) => State_Base) {
    for (let key = from; key <= to; ++key) {
      const value = create(key);
      this.set(key, value);
    }
  }
  set_all_of(
    keys: (number | string)[],
    create: (key: number | string) => State_Base,
  ) {
    for (const key of keys) {
      const value = create(key);
      this.set(key, value);
    }
  }

  fallback(type: TEntityEnum, code: number): State_Base {
    const state_key = `${type}_${code}`;
    let state = this.get(state_key);
    if (!state) {
      let State: typeof State_Base;
      switch (type) {
        case EntityEnum.Fighter:
          State = CharacterState_Base;
          break;
        case EntityEnum.Weapon:
          State = WeaponState_Base;
          break;
        case EntityEnum.Ball:
          State = BallState_Base;
          break;
        default:
          State = State_Base;
          break;
      }
      this.set(state_key, (state = new State(code)));
    }
    return state
  }
}
export default States;
