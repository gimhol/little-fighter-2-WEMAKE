import { O_ID, TeamEnum, GK } from "@/LF2/defines";
import { Factory } from "@/LF2/entity";
import { TestCase } from "../TestCase";


export class Jan_DUA extends TestCase {
  override readonly key: number = ++TestCase.KEY;
  override readonly name: string = 'Jan D^A'
  override enter(): void {

    const jan = this.spawn(O_ID.Jan)
    if (!jan) return;
    jan.set_position(this.midX, 0, this.midZ);
    jan.team = TeamEnum.Team_1;
    jan.attach();
    jan.ctrl.click(GK.d, GK.U, GK.a);

    this.bandits_8().forEach(v => {
      v.team = TeamEnum.Team_2;
    })
  }
}


