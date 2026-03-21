import { GK, O_ID, TeamEnum } from "@/LF2/defines";
import { TestCase } from "../TestCase";

export class Jan_DUJ extends TestCase {
  override readonly key: number = ++TestCase.KEY;
  override readonly name: string = 'Jan D^J'
  override enter(): void {
    do {
      const jan = this.spawn(O_ID.Jan)
      if (!jan) return;
      jan.set_position(this.midX, 0, this.midZ);
      jan.team = TeamEnum.Team_1;
      jan.key_role = false;
      jan.attach();
      jan.ctrl.click(GK.d, GK.U, GK.j);
    } while (0);

    this.bandits_8().forEach(v => {
      v.team = TeamEnum.Team_1;
      v.key_role = true;
      v.hp = 1;
    })
  }
}