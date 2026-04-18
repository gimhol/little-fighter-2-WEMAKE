import { ActionDirector, AGK, TestCase } from "@/LF2";
import { GK, O_ID } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";

export class FasterSlowerStandUp extends TestCase {
  override name: string = 'Pressing "A|D" Faster|Slower Stand Up';
  figters: Entity[] = [];
  director = new ActionDirector()
    .offset(10, () => {
      this.figters.forEach(v => v.ctrl.key_up(...AGK))
    }).offset(500, () => {
      this.figters.forEach(v => v.enter_frame({ id: v.data.indexes?.lying?.[1] }))
    }).offset(10, () => {
      this.figters[0].ctrl.key_down(GK.Attack)
      this.figters[2].ctrl.key_down(GK.Defend)
    }).wait(15000).times(10000);

  override update(dt: number): number | void | undefined {
    this.director.update(dt);
  }
  override enter(): void {
    super.enter()
    this.director.reset();
    this.figters = this.hori_3(O_ID.Hunter);
    this.figters.forEach(v => v.ctrl_visible = true)
  }
}
