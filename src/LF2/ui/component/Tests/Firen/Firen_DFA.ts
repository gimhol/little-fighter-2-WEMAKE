import { AGK, GK, O_ID, TeamEnum } from "@/LF2/defines";
import { ActionDirector } from "../ActionDirector";
import { TestCase } from "../TestCase";


export class Firen_DFA extends TestCase {
  override name: string = 'Firen D>A+A+A';
  director = new ActionDirector()
    .add(50, () => {
      this.entities[0]?.ctrl.key_up(...AGK).click(GK.Defend, GK.Right, GK.Attack).key_down(GK.Down);
      this.entities[1]?.ctrl.key_up(...AGK).click(GK.Defend, GK.Right, GK.Attack);
      this.entities[2]?.ctrl.key_up(...AGK).click(GK.Defend, GK.Right, GK.Attack).key_down(GK.Up);
    }).repeat(10, 50, () => {
      this.entities[0]?.ctrl.click(GK.Attack);
      this.entities[1]?.ctrl.click(GK.Attack);
      this.entities[2]?.ctrl.click(GK.Attack);
    })
    .wait(500)
    .sort();

  override update(dt: number): number | void | undefined {
    this.director.update(dt);
  }
  override enter(): void {
    this.director.reset();
    this.entities = this.verti_3(O_ID.Firen, 50);
    this.entities.forEach(o => {
      o.team = TeamEnum.Team_1;
      o.key_role = false;
      o.mp = 1000000;
    });
    this.bandits_mid_8();
  }
}
