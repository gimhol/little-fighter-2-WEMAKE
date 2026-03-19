import { GK, O_ID, TeamEnum } from "@/LF2/defines";
import { Factory } from "@/LF2/entity";
import { TestsState } from "./TestsState";

export class FIRZEN_DUA_TEST extends TestsState {
  override readonly key: number = ++TestsState.KEY;
  override enter(): void {
    do {
      const data = this.lf2.datas.find_fighter(O_ID.Firzen)
      if (!data) break;
      const fighter = Factory.inst.create_entity(data.type, this.world, data);
      if (!fighter) return;
      fighter.set_position(this.midX, 0, this.midZ);
      fighter.team = TeamEnum.Team_1
      fighter.attach();
      fighter.ctrl.click(GK.d, GK.U, GK.a)
    } while (0)

    do {
      const data = this.lf2.datas.find_fighter(O_ID.Bandit)
      if (!data) break;
      const l = this.left + 50;
      const r = this.right - 50;
      const m = this.midX;
      const o = this.midZ;
      const n = this.near - 20;
      const f = this.far + 20
      const pos = [
        [l, n], [m, n], [r, n], [r, o], [r, f], [m, f], [l, f], [l, o],
      ]
      for (const [x, z] of pos) {
        const fighter = Factory.inst.create_entity(data.type, this.world, data);
        if (!fighter) return;
        fighter.set_position(x, 0, z);
        fighter.team = TeamEnum.Team_2
        fighter.attach();
      }
    } while (0)
  }
}

