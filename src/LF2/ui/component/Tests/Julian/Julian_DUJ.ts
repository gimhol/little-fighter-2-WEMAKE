import { GK, O_ID, TeamEnum } from "@/LF2/defines";
import { TestCase } from "../TestCase";

export class Julian_DUJ extends TestCase {
  override readonly key: number = ++TestCase.KEY;
  override name: string = 'Julian D^J'
  override enter(): void {

    const julian = this.spawn(O_ID.Julian);
    if (!julian) return;
    julian.set_position(this.midX, 0, this.midZ);
    julian.team = TeamEnum.Team_1;
    julian.key_role = false
    julian.attach();
    julian.ctrl.click(GK.Defend, GK.Up, GK.Jump)


    this.bandits_mid_8().forEach(v => {
      v.team = TeamEnum.Team_2;
    })
  }
}

