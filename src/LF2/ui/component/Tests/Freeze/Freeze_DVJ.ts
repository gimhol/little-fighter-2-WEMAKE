import { AGK, GK, O_ID, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";
import { ActionDirector } from "../ActionDirector";
import { TestCase } from "../TestCase";

export class Freeze_DVJ extends TestCase {
  override readonly key: number = ++TestCase.KEY;
  override name: string = 'Freeze DvJ';
  freeze1?: Entity | null;
  director = new ActionDirector()
    .offset(500,
      () => {
        this.freeze1?.ctrl.key_up(...AGK).click(GK.Defend, GK.Down, GK.Jump)
      },
      () => {
        this.freeze1?.ctrl.key_down(GK.Down);
      }
    )
    .wait(500)
    .times(1000)
    .sort();

  override update(dt: number): number | void | undefined {
    this.director.update(dt);
  }
  override enter(): void {
    this.director.reset();
    const freezes = this.hori_3(O_ID.Freeze)
    freezes.forEach(o => {
      o.team = TeamEnum.Team_1;
      o.key_role = false;
      o.mp = 1000000;
    })
    this.freeze1 = freezes[0]
  }
}
