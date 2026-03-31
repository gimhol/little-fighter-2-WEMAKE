import { AGK, GK, O_ID, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";
import { ActionDirector } from "../ActionDirector";
import { TestCase } from "../TestCase";

export class Freeze_DVJ extends TestCase {
  override readonly key: number = ++TestCase.KEY;
  override name: string = 'Freeze DvJ';
  freezes: Entity[] = [];
  director = new ActionDirector()
    .offset(500,
      () => {
        this.freezes[0]?.ctrl.key_up(...AGK).click(GK.Defend, GK.Down, GK.Jump)
        this.freezes[1]?.ctrl.key_up(...AGK).click(GK.Defend, GK.Down, GK.Jump)
        this.freezes[2]?.ctrl.key_up(...AGK).click(GK.Defend, GK.Down, GK.Jump)
      }
    )
    .times(1000)
    .sort();

  override update(dt: number): number | void | undefined {
    this.director.update(dt);
  }
  override enter(): void {
    this.director.reset();
    this.freezes = this.hori_3(O_ID.Freeze)
    this.freezes.forEach(o => {
      o.team = TeamEnum.Team_1;
      o.key_role = false;
      o.mp = 1000000;
    })
  }
}
