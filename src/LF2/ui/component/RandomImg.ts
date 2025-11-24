import { Randoming } from "@/LF2/helper";
import { UIComponent } from "./UIComponent";
import { arithmetic_progression } from "@/LF2/utils";

export class RandomImg extends UIComponent {
  static override readonly TAG = 'RandomImg'
  static randomings = new Map<string | RandomImg, Randoming<number>>();
  get group() { return this.str(0) };
  get randoming() {
    const key = this.group || this;
    let ret = RandomImg.randomings.get(key);
    if (!ret) {
      const arr = arithmetic_progression(0, this.node.data.img.length, 1);
      RandomImg.randomings.set(key, ret = new Randoming(arr, null, false));
    }
    return ret;
  }
  override on_resume(): void {
    super.on_resume?.();
    this.node.img_idx.value = this.randoming.take();
  }
}

