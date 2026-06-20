import { Animation } from "./Animation";

export class Delay extends Animation {
  constructor(value: number) {
    super()
    this.value = value;
  }
  override calc(): this { return this; }
}
