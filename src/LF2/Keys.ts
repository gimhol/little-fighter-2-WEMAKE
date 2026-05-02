import { KeyStatus } from ".";
import * as D from "./defines";
import { LF2 } from "./LF2";
import { World } from "./World";

export class Keys {
  readonly lf2: LF2;
  readonly world: World;
  get time() { return this.lf2.world.update_time; }
  readonly [D.GK.L] = new KeyStatus(this);
  readonly [D.GK.R] = new KeyStatus(this);
  readonly [D.GK.U] = new KeyStatus(this);
  readonly [D.GK.D] = new KeyStatus(this);
  readonly [D.GK.a] = new KeyStatus(this);
  readonly [D.GK.j] = new KeyStatus(this);
  readonly [D.GK.d] = new KeyStatus(this);
  constructor(lf2: LF2) {
    this.lf2 = lf2;
    this.world = lf2.world;
  }
  recycle() {
    this.lf2.recycle_keys(this);
  }
}
