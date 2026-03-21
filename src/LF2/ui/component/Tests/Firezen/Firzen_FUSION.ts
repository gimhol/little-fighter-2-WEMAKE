import { GK, O_ID, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity/Entity";
import { TestCase } from "../TestCase";

export class Firzen_FUSION extends TestCase {
  override readonly key: number = ++TestCase.KEY;
  override name: string = 'Firzen = Freeze + Firen'
  firen?: Entity | null;
  freze?: Entity | null;

  override update(dt: number): number | void | undefined {
    const { firen, freze } = this;
    if (!firen || !freze) return;

    if (this.fsm.state_time > 6000) {
      firen.ctrl.click(GK.d, GK.j, GK.a)
      freze.ctrl.click(GK.d, GK.j, GK.a)
    } else if (this.fsm.state_time > 1200) {

    } else if (this.fsm.state_time > 1000) {
      firen.ctrl.db_hit(GK.R).key_up(GK.R)
      freze.ctrl.db_hit(GK.L).key_up(GK.L)
    }
  }
  override enter(): void {
    {
      const firen = this.firen = this.spawn(O_ID.Firen);
      if (!firen) return;
      firen.set_position(this.midX - 300, 0, this.midZ);
      firen.team = TeamEnum.Team_1
      firen.facing = 1;
      firen.hp = 100;
      firen.attach();
    }
    {
      const freze = this.freze = this.spawn(O_ID.Freeze);
      if (!freze) return;
      freze.set_position(this.midX + 300, 0, this.midZ);
      freze.team = TeamEnum.Team_1
      freze.facing = -1;
      freze.hp = 100;
      freze.attach();
    }
    this.bandits_8().forEach(v => {
      v.team = TeamEnum.Team_2
    })
  }
}

