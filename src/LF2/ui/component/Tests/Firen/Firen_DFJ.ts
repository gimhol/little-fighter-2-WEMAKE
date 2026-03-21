import { AGK, GK, O_ID, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";
import { TestCase } from "../TestCase";
import { ActionDirector } from "../ActionDirector";

export class Firen_DFJ extends TestCase {
  override readonly key: number = ++TestCase.KEY;
  override name: string = 'Firen D>J'
  firen?: Entity | null;
  director = new ActionDirector()
    .add(0, () => this.firen?.ctrl.key_up(...AGK).click(GK.Defend, GK.Right, GK.Jump))
    .add(500, () => this.firen?.ctrl.key_up(...AGK).key_down(GK.Up))
    .add(1000, () => this.firen?.ctrl.key_up(...AGK).key_down(GK.Down))
    .add(2000, () => this.firen?.ctrl.key_up(...AGK))
    .sort()

  override update(dt: number): number | void | undefined {
    this.director.update(dt)
  }
  override enter(): void {
    this.director.reset();
    do {
      const firen = this.firen = this.spawn(O_ID.Firen);
      if (!firen) return;
      firen.set_position(0, 0, this.midZ);
      firen.team = TeamEnum.Team_1;
      firen.key_role = false;
      firen.mp = 1000000;
      firen.attach();
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
