import { GK, O_ID, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity/Entity";
import { StatBarType } from "@/LF2/entity/StatBarType";
import { ActionDirector } from "../ActionDirector";
import { TestCase } from "../TestCase";

export class Bat_DUJ_0 extends TestCase {
  override name: string = 'Bat D^J'
  bat: Entity | null = null
  director = new ActionDirector()
    .offset(500, () => {
      this.bat?.ctrl.click(GK.d, GK.U, GK.j);
    })
    .wait(500)
    .times(1000)
    .sort();

  override update(dt: number): number | void | undefined {
    this.director.update(dt);
  }
  override enter(): void {
    do {
      const fighter = this.bat = this.spawn(O_ID.Bat)
      if (!fighter) return;
      fighter.set_position(this.midX, 0, this.midZ);
      fighter.team = TeamEnum.Team_1;
      fighter.attach();
      fighter.hp = 1;
      fighter.hp_r = 200;
      fighter.stat_bar_type = StatBarType.Float
      fighter.mp = fighter.mp_max = 1000000;
    } while (0);

    this.bandits_8().forEach(fighter => {
      fighter.stat_bar_type = StatBarType.Float
      fighter.team = TeamEnum.Team_2;
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