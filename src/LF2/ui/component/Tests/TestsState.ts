import { IState } from "@/LF2/base";
import { round_float } from "@/LF2/utils/math/round_float";
import { Tests } from ".";

export class TestsState implements IState<number> {
  static KEY: number = 0;
  readonly key: number = 0;
  readonly owner: Tests;
  get lf2() { return this.owner.lf2 }
  get world() { return this.owner.world }
  get bg() { return this.owner.world.bg }

  get left() { return this.world.bg.left; }
  get right() { return this.world.bg.right; }
  get far() { return this.world.bg.far; }
  get near() { return this.world.bg.near; }
  get midX() { return round_float((this.left + this.right) / 2); }
  get midZ() { return round_float((this.near + this.far) / 2); }

  constructor(owner: Tests) {
    this.owner = owner;
  }
  enter?(): void {

  }
  leave?(): void {
    this.owner.world.clear();
    this.owner.lf2.change_bg('bg_4');
  }
}
