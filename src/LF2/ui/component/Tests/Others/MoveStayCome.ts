import { ActionDirector, GK, LocalController, O_ID, TestCase } from "@/LF2";
import { Entity } from "@/LF2/entity";

export class MoveStayCome extends TestCase {
  override readonly key: number = ++TestCase.KEY;
  override name: string = 'MOVE(DADA) / STAY(DDDD) / COME(DJDJ)';
  figters: Entity[] = [];
  director = new ActionDirector()
    .offset(50, () => {
      this.figters.forEach(v => v.ctrl.click(GK.Defend))
    }).offset(50, () => {
      this.figters[0].ctrl.click(GK.Defend)
      this.figters[1].ctrl.click(GK.Jump)
      this.figters[2].ctrl.click(GK.Attack)
    }).offset(50, () => {
      this.figters.forEach(v => v.ctrl.click(GK.Defend))
    }).offset(50, () => {
      this.figters[0].ctrl.click(GK.Defend)
      this.figters[1].ctrl.click(GK.Jump)
      this.figters[2].ctrl.click(GK.Attack)
    });
  override update(dt: number): number | void | undefined {
    this.director.update(dt)
  }
  override enter(): void {
    this.director.reset();
    this.figters = this.hori_3(O_ID.Template, 80)
    this.figters.forEach((v, i) => {
      const player_id = `MoveStayCome_${i}`
      v.ctrl = new LocalController(player_id, v);
    })
  }
}


