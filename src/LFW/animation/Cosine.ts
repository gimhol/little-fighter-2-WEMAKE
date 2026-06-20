import { cos, PI } from "../utils/math/base";
import { Periodic } from "./Periodic";

export class Cosine extends Periodic {
  readonly method = (v: number) => {
    return (this.height * (cos(this.offset + v * 2 * PI / 1000) + 1) / 2) + this.bottom
  }
}
