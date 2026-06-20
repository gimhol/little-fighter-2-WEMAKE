import { PI, tan } from "../utils/math/base";
import { Periodic } from "./Periodic";

export class Tangent extends Periodic {
  readonly method = (v: number) => tan(v * 2 * PI / 1000);
}
