import { AGK, GK, O_ID, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity";
import { TestCase } from "../TestCase";
import { ActionDirector } from "../ActionDirector";

export class BottleUpDrop extends TestCase {
  override readonly key: number = ++TestCase.KEY;
  override name: string = 'Bottle-Up drop test (Alcohol abuse results in harm to your health)'
  figters: Entity[] = []
  director = new ActionDirector()
    .offset(1000,
      () => {
        this.figters.forEach(v => v.ctrl.click(GK.Attack))
      }, 
      () => {
        this.figters.forEach(v => v.ctrl.click(GK.Attack))
      }
    )
    .sort()

  override update(dt: number): number | void | undefined {
    this.director.update(dt)
  }
  override enter(): void {
    this.director.reset();
    this.figters = [
      ...this.mid_8(O_ID.Bandit),
      ...this.around_8(O_ID.Bandit),
    ]
    this.mid_8(O_ID.Weapon_Beer)
    this.around_8(O_ID.Weapon_milk)
  }
}
