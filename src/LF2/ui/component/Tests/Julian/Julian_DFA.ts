import { AGK, GK, O_ID, StateEnum, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";
import { ActionDirector } from "../ActionDirector";
import { TestCase } from "../TestCase";

export class Julian_DFA extends TestCase {
  override name: string = 'Julian D>A'
  julian?: Entity | null;
  director = new ActionDirector()
    .repeat(1000, 50, () => {
      const { julian } = this;
      if (!julian) return;
      if (StateEnum.Standing === julian.state)
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
    
    this.bandits_8().forEach(bandit => {
      bandit.team = TeamEnum.Team_2;
      bandit.hp = bandit.hp_r = bandit.hp_max = 75
      bandit.attach();
    })
  }
}
