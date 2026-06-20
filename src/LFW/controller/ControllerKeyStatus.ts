import { KeyStatus } from "./KeyStatus";
import type { BaseController } from "./BaseController";

export class ControllerKeyStatus {
  readonly owner: BaseController;
  L: KeyStatus;
  R: KeyStatus;
  U: KeyStatus;
  D: KeyStatus;
  d: KeyStatus;
  j: KeyStatus;
  a: KeyStatus;
  constructor(owner: BaseController) {
    this.owner = owner;
    this.L = new KeyStatus(this.owner);
    this.R = new KeyStatus(this.owner);
    this.U = new KeyStatus(this.owner);
    this.D = new KeyStatus(this.owner);
    this.d = new KeyStatus(this.owner);
    this.j = new KeyStatus(this.owner);
    this.a = new KeyStatus(this.owner);
  }
  to_snapshot(): number[][] {
    return [
      this.L.to_snapshot(),
      this.R.to_snapshot(),
      this.U.to_snapshot(),
      this.D.to_snapshot(),
      this.d.to_snapshot(),
      this.j.to_snapshot(),
      this.a.to_snapshot(),
    ];
  }
  from_snapshot(s: number[][]): void {
    this.L.from_snapshot(s[0]);
    this.R.from_snapshot(s[1]);
    this.U.from_snapshot(s[2]);
    this.D.from_snapshot(s[3]);
    this.d.from_snapshot(s[4]);
    this.j.from_snapshot(s[5]);
    this.a.from_snapshot(s[6]);
  }
}
