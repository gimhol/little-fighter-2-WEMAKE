import { AGK, GK, O_ID, StateEnum, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";
import { ActionDirector } from "../ActionDirector";
import { TestCase } from "../TestCase";

export class Julian_DFA extends TestCase {
  override readonly key: number = ++TestCase.KEY;
  override name: string = 'Julian D>A'
  julian?: Entity | null;
  director = new ActionDirector()
    .repeat(1000, 50, () => {
      const { julian } = this;
      if (!julian) return;
      if (StateEnum.Standing === julian.frame.state)
        this.julian?.ctrl.key_up(...AGK).click(GK.Defend, GK.Right, GK.Attack)
      else
        this.julian?.ctrl.key_up(...AGK).click(GK.Attack)
    })
    .times(9999)
    .sort()

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
        bandit.hp = bandit.hp_r = bandit.hp_max = 75
        bandit.ctrl.click(GK.Defend);
      }
    } while (0);
  }
}
