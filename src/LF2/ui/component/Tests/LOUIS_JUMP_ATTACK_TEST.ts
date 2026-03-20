import { GK, O_ID, TeamEnum } from "@/LF2/defines";
import { Entity, Factory } from "@/LF2/entity";
import { TestsState } from "./TestsState";


export class LOUIS_JUMP_ATTACK_TEST extends TestsState {
  override readonly key: number = ++TestsState.KEY;
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
    const louis_data = this.lf2.datas.find_fighter(O_ID.Louis);
    const bandit_data = this.lf2.datas.find_fighter(O_ID.Bandit);
    if (!louis_data || !bandit_data) return;
    do {
      const louis = this.louis1 = Factory.inst.create_entity(louis_data.type, this.world, louis_data) || null;
      const bandit = this.bandit1 = Factory.inst.create_entity(bandit_data.type, this.world, bandit_data) || null;;
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
      const louis = this.louis2 = Factory.inst.create_entity(louis_data.type, this.world, louis_data) || null;
      const bandit = this.bandit2 = Factory.inst.create_entity(bandit_data.type, this.world, bandit_data) || null;;
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
