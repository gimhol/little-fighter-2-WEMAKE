import { GK, O_ID, OID, StateEnum, TeamEnum } from "@/LF2/defines";
import { Entity } from "@/LF2/entity/Entity";
import { TestCase } from "../TestCase";

export class Firzen_DUA_0 extends TestCase {
  override name: string = 'Firezen D^A 0'
  firzen?: Entity | null;

  override update(dt: number): number | void | undefined {
    const { firzen } = this;
    if (!firzen) return;
    if (firzen.mp > 100 && firzen.state === StateEnum.Standing)
      firzen.ctrl.click(GK.d, GK.U, GK.a)
    else if (
      firzen.mp > 100 &&
      firzen.state !== StateEnum.Standing &&
      firzen.frame.hit?.a
    ) firzen.ctrl.click(GK.a)
  }
  override enter(): void {
    const firzen = this.firzen = this.spawn(O_ID.Firzen);
    if (!firzen) return;
    firzen.set_position(this.midX, 0, this.midZ);
    firzen.team = TeamEnum.Team_1
    firzen.attach();
    firzen.ctrl.click(GK.d, GK.U, GK.a)
  }
}

export class Firzen_DUA_1 extends TestCase {
  override name: string = 'Firezen D^A 1'
  firzen?: Entity | null;

  override update(dt: number): number | void | undefined {
    const { firzen } = this;
    if (!firzen) return;
    if (firzen.mp > 100 && firzen.state === StateEnum.Standing)
      firzen.ctrl.click(GK.d, GK.U, GK.a)
    else if (
      firzen.mp > 100 &&
      firzen.state !== StateEnum.Standing &&
      firzen.frame.hit?.a
    ) firzen.ctrl.click(GK.a)
  }
  override enter(): void {

    const firzen = this.firzen = this.spawn(O_ID.Firzen);
    if (!firzen) return;
    firzen.set_position(this.midX, 0, this.midZ);
    firzen.team = TeamEnum.Team_1
    firzen.attach();
    firzen.ctrl.click(GK.d, GK.U, GK.a)

    this.bandits_8().forEach(v => {
      v.team = TeamEnum.Team_2;
      v.hp = 100
    })
  }
}


export class Firzen_DUA_2 extends TestCase {
  override name: string = 'Firezen D^A 2'
  firzen?: Entity | null;

  override update(dt: number): number | void | undefined {
    const { firzen } = this;
    if (!firzen) return;
    if (firzen.mp > 100 && firzen.state === StateEnum.Standing)
      firzen.ctrl.click(GK.d, GK.U, GK.a)
    else if (
      firzen.mp > 100 &&
      firzen.state !== StateEnum.Standing &&
      firzen.frame.hit?.a
    ) firzen.ctrl.click(GK.a)
  }
  override enter(): void {

    const firzen = this.firzen = this.spawn(O_ID.Firzen);
    if (!firzen) return;
    firzen.set_position(this.midX, 0, this.midZ);
    firzen.team = TeamEnum.Team_1
    firzen.attach();
    firzen.ctrl.click(GK.d, GK.U, GK.a)

    this.circle(OID.Bandit, this.midX, this.midZ, this.bg.width / 2, this.bg.depth / 2, 80).forEach(v => {
      v.team = TeamEnum.Team_2;
      v.hp = 100
    })
  }
}

