import { Label } from "@/LF2";
import { Defines } from "../../defines";
import { GameKey } from "../../defines/GameKey";

export class PlayerKeyText extends Label {
  static override readonly TAGS: string[] = ["PlayerKeyText"];
  get player_id() { return this.args[0] || this.node.find_parent(v => v.data.values?.player_id)?.data.values?.player_id || ''; }
  get key_name() { return this.args[1] || this.node.find_parent(v => v.data.values?.key_name)?.data.values?.key_name || ''; }
  get player() { return this.lf2.players.get(this.player_id); }
  get key_code() {
    const { player } = this;
    if (!player) return 'NOT SET'
    const kc = player.keys[this.key_name as GameKey]?.toUpperCase();
    return Defines.SHORT_KEY_CODES[kc] || kc || 'NOT SET'
  }
  override on_resume() {
    super.on_resume();
    this.player?.callbacks.add(this)
    this.on_key_changed();
  }
  override on_pause(): void {
    super.on_pause();
    this.player?.callbacks.del(this)
  }
  on_key_changed() {
    this.set_text(this.key_code)
  }
}
