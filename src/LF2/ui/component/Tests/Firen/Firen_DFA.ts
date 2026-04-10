import { AGK, GK, O_ID, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";
import { ActionDirector } from "../ActionDirector";
import { TestCase } from "../TestCase";


export class Firen_DFA extends TestCase {
  override name: string = 'Firen D>A+A+A';
  firen1?: Entity | null;
  firen2?: Entity | null;
  firen3?: Entity | null;
  director = new ActionDirector()
    .add(50, () => {
      this.firen1?.ctrl.key_up(...AGK).click(GK.Defend, GK.Right, GK.Attack).key_down(GK.Down);
      this.firen2?.ctrl.key_up(...AGK).click(GK.Defend, GK.Right, GK.Attack);
      this.firen3?.ctrl.key_up(...AGK).click(GK.Defend, GK.Right, GK.Attack).key_down(GK.Up);
    }).repeat(10, 50, () => {
      this.firen1?.ctrl.click(GK.Attack);
      this.firen2?.ctrl.click(GK.Attack);
      this.firen3?.ctrl.click(GK.Attack);
    })
    .wait(500)
    .sort();

  override update(dt: number): number | void | undefined {
    this.director.update(dt);
  }
  override enter(): void {
    this.director.reset();
    const firens = this.verti_3(O_ID.Firen, 50);
    firens.forEach(o => {
      o.team = TeamEnum.Team_1;
      o.key_role = false;
      o.mp = 1000000;
    });
    this.firen1 = firens[0];
    this.firen2 = firens[1];
    this.firen3 = firens[2];
    this.bandits_mid_8();
  }
}
