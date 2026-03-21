import { AGK, GK, O_ID, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";
import { ActionDirector } from "../ActionDirector";
import { TestCase } from "../TestCase";


export class Firen_DVJ extends TestCase {
  override readonly key: number = ++TestCase.KEY;
  override name: string = 'Firen DvJ';
  firen1?: Entity | null;
  firen2?: Entity | null;
  firen3?: Entity | null;
  director = new ActionDirector()
    .offset(500,
      () => {
        this.firen1?.ctrl.key_up(...AGK).click(GK.Defend, GK.Down, GK.Jump)
        this.firen2?.ctrl.key_up(...AGK).click(GK.Defend, GK.Down, GK.Jump)
        this.firen3?.ctrl.key_up(...AGK).click(GK.Defend, GK.Down, GK.Jump)
      },
      () => {
        this.firen1?.ctrl.key_down(GK.Down);
        this.firen3?.ctrl.key_down(GK.Up);
      }
    )
    .wait(500)
    .sort();

  override update(dt: number): number | void | undefined {
    this.director.update(dt);
  }
  override enter(): void {
    this.director.reset();
    const firens = this.hori_3(O_ID.Firen)
    firens.forEach(o => {
      o.team = TeamEnum.Team_1;
      o.key_role = false;
      o.mp = 1000000;
    })
    this.firen1 = firens[0]
    this.firen2 = firens[1]
    this.firen3 = firens[2]
  }
}
