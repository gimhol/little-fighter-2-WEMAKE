import { TestCase, ActionDirector, TeamEnum, Factory } from "@/LF2";
import { LocalController } from "@/LF2/controller";
import { GK, O_ID } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";


export class BotCome extends TestCase {
  override name: string = 'Bot Response COME(DJDJ)';
  figters: Entity[] = [];
  director = new ActionDirector()
    .offset(50,
      () => this.figters[0].ctrl.click(GK.Defend),
      () => this.figters[0].ctrl.click(GK.Jump),
      () => this.figters[0].ctrl.click(GK.Defend),
      () => this.figters[0].ctrl.click(GK.Jump)
    ).wait(1500).offset(50,
      () => this.figters[1].ctrl.click(GK.Defend),
      () => this.figters[1].ctrl.click(GK.Jump),
      () => this.figters[1].ctrl.click(GK.Defend),
      () => this.figters[1].ctrl.click(GK.Jump)
    ).wait(1500).times(10000);

  override update(dt: number): number | void | undefined {
    this.director.update(dt);
  }
  override enter(): void {
    this.director.reset();
    this.figters = this.hori_2(O_ID.Mark, 350);
    this.figters.forEach((v, i) => {
      const player_id = `MoveStayCome_${i}`;
      v.ctrl = new LocalController(player_id, v);
      v.team = TeamEnum.Team_1
    });

    this.bandits_8().forEach(v => {
      v.team = TeamEnum.Team_1
      v.ctrl = this.owner.lf2.factory.create_ctrl(O_ID.Bandit, '', v)
    })
  }
}
