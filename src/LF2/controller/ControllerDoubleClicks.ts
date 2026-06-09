import type { BaseController } from "./BaseController";
import { DoubleClick } from "./DoubleClick";
import type { IControllerDoubleClickData } from "./IControllerDoubleClickData";
import type { IControllerDoubleClicksSnapshot } from "./IControllerDoubleClicksSnapshot";

export class ControllerDoubleClicks {
  readonly owner: BaseController;
  L: DoubleClick<IControllerDoubleClickData>;
  R: DoubleClick<IControllerDoubleClickData>;
  U: DoubleClick<IControllerDoubleClickData>;
  D: DoubleClick<IControllerDoubleClickData>;
  d: DoubleClick<IControllerDoubleClickData>;
  j: DoubleClick<IControllerDoubleClickData>;
  a: DoubleClick<IControllerDoubleClickData>;

  constructor(owner: BaseController) {
    this.owner = owner;
    this.L = new DoubleClick("d");
    this.R = new DoubleClick("a");
    this.U = new DoubleClick("j");
    this.D = new DoubleClick("L");
    this.d = new DoubleClick("R");
    this.j = new DoubleClick("U");
    this.a = new DoubleClick("D");
  }

  to_snapshot(): IControllerDoubleClicksSnapshot {
    return {
      L: this.L.to_snapshot(),
      R: this.R.to_snapshot(),
      U: this.U.to_snapshot(),
      D: this.D.to_snapshot(),
      d: this.d.to_snapshot(),
      j: this.j.to_snapshot(),
      a: this.a.to_snapshot(),
    };
  }

  from_snapshot(s: IControllerDoubleClicksSnapshot) {
    this.L.from_snapshot(s.L);
    this.R.from_snapshot(s.R);
    this.U.from_snapshot(s.U);
    this.D.from_snapshot(s.D);
    this.d.from_snapshot(s.d);
    this.j.from_snapshot(s.j);
    this.a.from_snapshot(s.a);
  }
}
