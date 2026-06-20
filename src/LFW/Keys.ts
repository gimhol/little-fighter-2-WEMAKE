import { KeyStatus } from "./controller/KeyStatus";
import { GK } from "./defines/GameKey";
import { LFW } from "./LFW";
import { World } from "./World";

export class Keys {
  readonly lfw: LFW;
  readonly world: World;
  get time() { return this.lfw.world.lifetime; }
  readonly [GK.L] = new KeyStatus(this);
  readonly [GK.R] = new KeyStatus(this);
  readonly [GK.U] = new KeyStatus(this);
  readonly [GK.D] = new KeyStatus(this);
  readonly [GK.a] = new KeyStatus(this);
  readonly [GK.j] = new KeyStatus(this);
  readonly [GK.d] = new KeyStatus(this);
  constructor(lfw: LFW) {
    this.lfw = lfw;
    this.world = lfw.world;
  }
  mount(): void {
    this.lfw.regist_keys(this);
  }
  unmount(): void {
    this.lfw.recycle_keys(this);
  }
}
