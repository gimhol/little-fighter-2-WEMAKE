import { Periodic } from "./Periodic";
import { sin, PI } from "../utils/math/base";
export class Sine extends Periodic {
  constructor(...args: ConstructorParameters<typeof Periodic>) { super(...args) }
  readonly method = (v: number) => {
    return (this.height * (sin(v * 2 * PI / 1000) + 1) / 2) + this.bottom
  }
}
