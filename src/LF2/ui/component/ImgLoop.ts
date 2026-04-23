import { IPropsMeta } from "@/LF2";
import { Easing } from "../../animation";
import ease_linearity from "../../utils/ease_method/ease_linearity";
import { floor } from "../../utils/math/base";
import { UIComponent } from "./UIComponent";
export interface IImgLoopProps {
  w: number,
  h: number,
  col: number,
  row: number,
  count: number,
  duration?: number,
}
export class ImgLoop extends UIComponent<IImgLoopProps> {
  static override readonly TAGS: string[] = ["ImgLoop"];
  static override readonly PROPS: IPropsMeta<IImgLoopProps> = {
    w: { type: Number, nullable: false },
    h: { type: Number, nullable: false },
    col: { type: Number, nullable: false },
    row: { type: Number, nullable: false },
    count: { type: Number, nullable: false },
    duration: { type: Number, nullable: true },
  }
  readonly anim = new Easing(0, 1).set_duration(1000)
    .set_ease_method(ease_linearity)
    .set_times(0)
    .set_fill_mode(1)
  override on_start(): void {
    this.anim
      .set(0, this.props.count)
      .set_duration(this.props.duration || this.anim.duration)
  }
  stop(): void {
    this.anim.set_times(1).set_count(0)
  }
  start(): void {
    if (!this.enabled) this.enabled = true;
    this.anim.set_times(0).set_count(0)
  }
  override update(dt: number): void {
    if (!this.node.data.img) {
      this.enabled = false;
      return;
    }
    this.anim.update(dt);
    const idx = floor(this.anim.value);
    // this.node.img_idx.value = idx;
    if (this.anim.done) this.enabled = false;
  }
}