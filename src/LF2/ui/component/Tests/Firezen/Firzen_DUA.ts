import { GK, O_ID, StateEnum, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity/Entity";
import { TestCase } from "../TestCase";

export class Firzen_DUA extends TestCase {
  override readonly key: number = ++TestCase.KEY;
  override name: string = 'Firezen D^A'
  firzen?: Entity | null;

  override update(dt: number): number | void | undefined {
    const { firzen } = this;
    if (!firzen) return;
    if (firzen.mp > 100 && firzen.frame.state === StateEnum.Standing)
      firzen.ctrl.click(GK.d, GK.U, GK.a)
    else if (
      firzen.mp > 100 &&
      firzen.frame.state !== StateEnum.Standing &&
      firzen.frame.hit?.a
    ) firzen.ctrl.click(GK.a)
  }
  override enter(): void {

    const firzen = this.firzen = this.spawn(O_ID.Firzen);
    if (!firzen) return;
    firzen.set_position(this.midX, 0, this.midZ);
    firzen.team = TeamEnum.Team_1
    firzen.attach();
    firzen.ctrl.click(GK.d, GK.U, GK.a)

    this.bandits_8().forEach(v => {
      v.team = TeamEnum.Team_2;
    })
  }
}

