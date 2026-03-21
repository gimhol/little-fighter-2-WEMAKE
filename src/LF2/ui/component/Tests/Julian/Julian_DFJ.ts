import { GK, StateEnum, AGK, O_ID, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";
import { TestsState } from "../TestsState";

export class Julian_DFJ extends TestsState {
  override readonly key: number = ++TestsState.KEY;
  julian?: Entity | null;
  action_idx = 0;
  actions = [
    () => this.julian?.ctrl.click(GK.Defend, GK.Right, GK.Jump),
    () => this.julian?.ctrl.click(GK.Defend, GK.Right, GK.Jump).key_down(GK.Down),
    () => this.julian?.ctrl.click(GK.Defend, GK.Right, GK.Jump).key_down(GK.Up),
    () => this.julian?.ctrl.click(GK.Defend, GK.Left, GK.Jump),
    () => this.julian?.ctrl.click(GK.Defend, GK.Left, GK.Jump).key_down(GK.Down),
    () => this.julian?.ctrl.click(GK.Defend, GK.Left, GK.Jump).key_down(GK.Up),
  ].filter(Boolean);
  override update(dt: number): number | void | undefined {
    const { julian } = this;
    if (!julian) return;
    if ([StateEnum.Standing, StateEnum.Walking].includes(julian.frame.state)) {
      julian.ctrl.key_up(...AGK);
      this.actions.at(this.action_idx)?.();
      this.action_idx = (this.action_idx + 1) % this.actions.length;
    }
  }
  override enter(): void {
    do {
      const julian = this.julian = this.spawn(O_ID.Julian);
      if (!julian) return;
      julian.set_position(this.midX, 0, this.midZ);
      julian.team = TeamEnum.Team_1;
      julian.key_role = false;
      julian.mp = 1000000;
      julian.attach();
    } while (0);

    do {
      const l = this.midX + 100;
      const r = this.midX - 100;
      const m = this.midX;
      const o = this.midZ;
      const n = this.midZ - 50;
      const f = this.midZ + 50;
      const pos = [
        [l, n], [m, n], [r, n], [r, o], [r, f], [m, f], [l, f], [l, o],
      ];
      for (const [x, z] of pos) {
        const bandit = this.spawn(O_ID.Bandit);
        if (!bandit) return;
        bandit.set_position(x, 0, z);
        bandit.team = TeamEnum.Team_2;
        bandit.attach();
        bandit.ctrl.click(GK.Defend);
      }
    } while (0);
  }
}
