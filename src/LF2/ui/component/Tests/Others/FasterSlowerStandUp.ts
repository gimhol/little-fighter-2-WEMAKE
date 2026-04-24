import { ActionDirector, AGK, TestCase } from "@/LF2";
import { GK, O_ID } from "@/LF2/defines";
import { Entity, StatBarType } from "@/LF2/entity";

export class FasterSlowerStandUp extends TestCase {
  override name: string = 'Press A/D faster or slower to stand up';
  figters: Entity[] = [];
  director = new ActionDirector()
    .offset(10, () => {
      this.figters.forEach(v => v.ctrl.key_up(...AGK))
    }).offset(500, () => {
      this.figters.forEach(v => {
        v.set_velocity_y(5)
        v.enter_frame({ id: v.data.indexes?.falling?.[1] })
      })
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
    this.figters = this.hori_3(O_ID.Hunter, 80);
    this.figters.forEach(v => {
      v.stat_bar_type = StatBarType.None
      v.wakeup_invuln = true
      v.ctrl_visible = true
      v.name_visible = true
    })
    this.figters[0].name = `Press "A"`
    this.figters[1].name = `Default`
    this.figters[2].name = `Press "D"`
  }
}
