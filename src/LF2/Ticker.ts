import { Callbacks } from "./base";
import { LF2 } from "./LF2";
import { Times } from "./utils";
export interface ITickerCallbacks {
  tick?(ticker: Ticker): void;
  end?(ticker: Ticker): void;
}

export class Ticker extends Times {
  readonly lf2: LF2;
  readonly callbacks = new Callbacks<ITickerCallbacks>();
  released: boolean = false
  constructor(lf2: LF2) {
    super();
    this.lf2 = lf2;
  }
  override reborn(): this {
    super.reborn();
    this.released = false
    return this;
  }
  override add(d?: number): boolean {
    const ret = super.add(d);
    if (ret) this.callbacks.emit('tick')(this)
    if (ret && !this.remains) this.callbacks.emit('end')(this)
    return ret;
  }
  release() {
    this.released = true;
    this.callbacks.clear();
  }
}
