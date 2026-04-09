import { TestCase, ActionDirector } from "@/LF2";
import { LocalController } from "@/LF2/controller";
import { GK, O_ID } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";


export class Come extends TestCase {
  override readonly key: number = ++TestCase.KEY;
  override name: string = 'MOVE(DADA) / STAY(DDDD) / COME(DJDJ)';
  figters: Entity[] = [];
  director = new ActionDirector()
    .offset(50, () => {
      this.figters.forEach(v => v.ctrl.click(GK.Defend));
    }).offset(50, () => {
      this.figters[0].ctrl.click(GK.Jump);
      this.figters[1].ctrl.click(GK.Jump);
    }).offset(50, () => {
      this.figters.forEach(v => v.ctrl.click(GK.Defend));
    }).offset(50, () => {
      this.figters[0].ctrl.click(GK.Jump);
      this.figters[1].ctrl.click(GK.Jump);
    });
  override update(dt: number): number | void | undefined {
    this.director.update(dt);
  }
  override enter(): void {
    this.director.reset();
    this.figters = this.hori_2(O_ID.Mark, 350);
    this.figters.forEach((v, i) => {
      const player_id = `MoveStayCome_${i}`;
      v.ctrl = new LocalController(player_id, v);
    });
  }
}
