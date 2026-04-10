import { AGK, GK, O_ID, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";
import { ActionDirector } from "../ActionDirector";
import { TestCase } from "../TestCase";

export class Julian_DFJ extends TestCase {
  override name: string = 'Julian D>J'
  julian?: Entity | null;
  director = new ActionDirector()
    .offset(700,
      () => this.julian?.ctrl.key_up(...AGK).click(GK.Defend, GK.Right, GK.Jump),
      () => this.julian?.ctrl.key_up(...AGK).click(GK.Defend, GK.Right, GK.Jump).key_down(GK.Down),
      () => this.julian?.ctrl.key_up(...AGK).click(GK.Defend, GK.Right, GK.Jump).key_down(GK.Up),
      () => this.julian?.ctrl.key_up(...AGK).click(GK.Defend, GK.Left, GK.Jump),
      () => this.julian?.ctrl.key_up(...AGK).click(GK.Defend, GK.Left, GK.Jump).key_down(GK.Down),
      () => this.julian?.ctrl.key_up(...AGK).click(GK.Defend, GK.Left, GK.Jump).key_down(GK.Up),
      () => this.julian?.ctrl.key_up(...AGK)
    ).sort()

  override update(dt: number): number | void | undefined {
    this.director.update(dt)
  }
  override enter(): void {
    this.director.reset()
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
