import { GK } from "./defines/GameKey";
import { KeyStatus } from "./controller/KeyStatus";
import { LF2 } from "./LF2";
import { World } from "./World";

export class Keys {
  readonly lf2: LF2;
  readonly world: World;
  get time() { return this.lf2.world.lifetime; }
  readonly [GK.L] = new KeyStatus(this);
  readonly [GK.R] = new KeyStatus(this);
  readonly [GK.U] = new KeyStatus(this);
  readonly [GK.D] = new KeyStatus(this);
  readonly [GK.a] = new KeyStatus(this);
  readonly [GK.j] = new KeyStatus(this);
  readonly [GK.d] = new KeyStatus(this);
  constructor(lf2: LF2) {
    this.lf2 = lf2;
    this.world = lf2.world;
  }
  mount(): void {
    this.lf2.regist_keys(this);
  }
  unmount(): void {
    this.lf2.recycle_keys(this);
  }
}
