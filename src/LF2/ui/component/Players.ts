import { PlayerInfo } from "../../PlayerInfo";
import { UIComponent } from "./UIComponent";

export class Players extends UIComponent {
  static override readonly TAG = 'Players';
  readonly players = new Set<PlayerInfo>();
  get max(): number { return this.props.num('max') ?? 8; };

  player_join(player: PlayerInfo) {
    const { max } = this;
    const { size } = this.players;
    if (size >= max)
      return false;
    this.players.add(player);
    return true;
  }

  player_leave(player: PlayerInfo) {
    this.players.delete(player);
  }
}
