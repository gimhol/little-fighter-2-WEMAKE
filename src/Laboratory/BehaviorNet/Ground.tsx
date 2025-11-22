import { Ditto } from "@/LF2/ditto";
import { Creature } from "./Creature";

export class Ground {
  pos = new Ditto.Vector2(0, 0);
  size = new Ditto.Vector2(0, 0);
  creatures = new Array<Creature>();
  add_creature(...creatures: Creature[]) {
    this.creatures.push(...creatures);
    for (const c of creatures) c.ground = this;
  }
  update(delta_time: number) {
    this.creatures.forEach((v) => v.update(delta_time));
  }
  render(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.pos.x, this.pos.y);
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, this.size.x, this.size.y);
    this.creatures.forEach((v) => v.render(ctx));
  }
}
