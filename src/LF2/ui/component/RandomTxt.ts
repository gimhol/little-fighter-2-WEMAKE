import { Randoming } from "@/LF2/helper";
import { arithmetic_progression } from "@/LF2/utils";
import { UIComponent } from "./UIComponent";


export class RandomTxt extends UIComponent {
  static override readonly TAG = 'RandomTxt';
  static randomings = new Map<string | RandomTxt, Randoming<number>>();
  get group() { return this.str(0); };
  get randoming() {
    const key = this.group || this;
    let ret = RandomTxt.randomings.get(key);
    if (!ret) {
      const arr = arithmetic_progression(0, this.node.data.txt.length, 1);
      RandomTxt.randomings.set(key, ret = new Randoming(arr, null, false));
    }
    return ret;
  }
  override on_resume(): void {
    super.on_resume?.();
    this.node.txt_idx.value = this.randoming.take();
  }
}
