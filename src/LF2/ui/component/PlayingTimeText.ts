import { floor } from "../../utils";
import { Text } from "./Text";

export class PlayingTimeText extends Text {
  static override readonly TAG = 'PlayingTimeText'

  override on_show(): void {
    this.text = this.get_txt();
  }

  protected get_txt(): string {
    const ms = floor(this.world.stage.time * 16.6666) / 60;
    const s = floor(ms / 1000) % 60;
    const m = floor(ms / (60 * 1000)) % 60;
    const h = floor(ms / (60 * 60 * 1000)) % 60;
    let ret = "";
    if (h) ret += h + ":";
    if (m > 9 || !h) ret += m + ":";
    else ret += "0" + m + ":";
    if (s > 9) ret += s;
    else ret += "0" + s;
    return ret;
  }
}
