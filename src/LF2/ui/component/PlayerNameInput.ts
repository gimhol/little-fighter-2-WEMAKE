import { PlayerInfo } from "../../PlayerInfo";
import { TextInput } from "./TextInput";

export class PlayerNameInput extends TextInput {
  static override readonly TAG: string = 'PlayerNameInput';
  player: PlayerInfo | undefined;

  get player_id() { return this.node.get_value("player_id", true) }

  override get maxLength() { return this.props.num('maxLength') ?? 10; }
  override get defaultValue() { return this.props.str('defaultValue'); }
  override get text(): string {
    return this.player?.name ?? '';
  }
  override set text(text: string) {
    this.player?.set_name(text, true).save();
  }
  override on_start(): void {
    this.player = this.lf2.players.get(this.player_id);
    this.player?.callbacks.add(this)
  }
  override on_stop(): void {
    this.player?.callbacks.del(this)
  }
  on_name_changed(name: string) {
    this._text = name
  }
}
