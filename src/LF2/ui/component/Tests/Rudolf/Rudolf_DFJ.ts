import { AGK, Defines, GK, O_ID, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";
import { ActionDirector } from "../ActionDirector";
import { TestCase } from "../TestCase";
import { CMD } from "@/LF2/defines/CMD";

export class Rudolf_DFJ extends TestCase {
  override readonly key: number = ++TestCase.KEY;
  override name: string = 'Rudolf D>J 2';
  fighters: Entity[] = [];
  director = new ActionDirector()
    .offset(100,
      () => {

      }
    )
    .offset(500, () => {

    })
    .offset(500, () => {

    })
    .wait(1000)
    .times(999)
    .sort();

  override update(dt: number): number | void | undefined {
    this.director.update(dt);
  }
  override enter(): void {
    this.owner.world.clear();
    this.owner.lf2.change_bg('bg_moon');
    this.lf2.cmds.push(CMD.LOCK_CAM, `${this.midX - Defines.MODERN_SCREEN_WIDTH / 2}`)
    this.director.reset();
    this.fighters = this.hori_3(O_ID.Rudolf, 100)
    this.fighters.forEach(o => {
      o.team = TeamEnum.Team_1;
      o.key_role = false;
      o.mp = 1000000;
    })
  }
}
