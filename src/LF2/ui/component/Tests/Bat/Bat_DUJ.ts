import { GK, O_ID, TeamEnum } from "@/LF2/defines";
import { TestCase } from "../TestCase";

export class Bat_DUJ_0 extends TestCase {
  override name: string = 'Bat D^J'
  override enter(): void {
    do {
      const fighter = this.spawn(O_ID.Bat)
      if (!fighter) return;
      fighter.set_position(this.midX, 0, this.midZ);
      fighter.team = TeamEnum.Team_1;
      fighter.key_role = false;
      fighter.attach();
      fighter.ctrl.click(GK.d, GK.U, GK.j);
    } while (0);

    this.bandits_8().forEach(v => {
      v.team = TeamEnum.Team_2;
      v.hp = 1
    })
  }
}
export class Bat_DUJ_1 extends TestCase {
  override name: string = 'Bat D^J (No Enemies)'
  override enter(): void {
    do {
      const fighter = this.spawn(O_ID.Bat)
      if (!fighter) return;
      fighter.set_position(this.midX, 0, this.midZ);
      fighter.team = TeamEnum.Team_1;
      fighter.key_role = false;
      fighter.attach();
      fighter.ctrl.click(GK.d, GK.U, GK.j);
    } while (0);
  }
}
export class Bat_DUJ_2 extends TestCase {
  override name: string = 'Bat D^J (Less Than 3 Enemies)'
  override enter(): void {
    do {
      const fighter = this.spawn(O_ID.Bat)
      if (!fighter) return;
      fighter.set_position(this.midX, 0, this.midZ);
      fighter.team = TeamEnum.Team_1;
      fighter.key_role = false;
      fighter.attach();
      fighter.ctrl.click(GK.d, GK.U, GK.j);
    } while (0);

    this.hori_2(O_ID.Bandit, 200).forEach(v => {
      v.team = TeamEnum.Team_2;
      v.hp = 50
    })
  }
}