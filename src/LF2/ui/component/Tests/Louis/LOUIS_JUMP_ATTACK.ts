import { GK, O_ID, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";
import { TestCase } from "../TestCase";


export class LOUIS_JUMP_ATTACK extends TestCase {
  override readonly key: number = ++TestCase.KEY;
  override name: string = 'Normal Jump / Small Jump'
  louis1: Entity | null = null;
  louis2: Entity | null = null;
  bandit1: Entity | null = null;
  bandit2: Entity | null = null;
  override update(): number | void | undefined {
    const time = this.owner.fsm.state_time % 5000;
    if (time > 1200) {
      this.louis1?.ctrl.key_up(GK.j, GK.a)
      this.louis2?.ctrl.key_up(GK.j, GK.a)
    } else if (time > 1000) {
      this.louis1?.ctrl.key_down(GK.j).key_down(GK.a);
      this.louis2?.ctrl.click(GK.j).key_down(GK.a);
      this.bandit1?.ctrl.click(GK.d)
      this.bandit2?.ctrl.click(GK.d)
    }
  }
  override enter(): void {
    do {
      const louis = this.louis1 = this.spawn(O_ID.Louis);
      const bandit = this.bandit1 = this.spawn(O_ID.Bandit);
      if (!louis || !bandit) return;
      louis.set_position(this.midX - 125, 0, this.midZ);
      louis.team = TeamEnum.Team_1;
      louis.key_role = false
      louis.attach();

      bandit.set_position(this.midX - 125 + 30, 0, this.midZ);
      bandit.team = TeamEnum.Team_4;
      bandit.key_role = false
      bandit.facing = -1;
      bandit.attach();
    } while (0);

    do {
      const louis = this.louis2 = this.spawn(O_ID.Louis);
      const bandit = this.bandit2 = this.spawn(O_ID.Bandit);
      if (!louis || !bandit) return;
      louis.set_position(this.midX + 75, 0, this.midZ);
      louis.team = TeamEnum.Team_1;
      louis.key_role = false
      louis.attach();

      bandit.set_position(this.midX + 75 + 30, 0, this.midZ);
      bandit.team = TeamEnum.Team_4;
      bandit.key_role = false
      bandit.facing = -1;
      bandit.attach();
    } while (0);

  }
}
