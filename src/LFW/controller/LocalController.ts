import { Entity } from "../entity/Entity";
import { PlayerInfo } from "../PlayerInfo";
import { BaseController } from "./BaseController";

export class LocalController
  extends BaseController {
  readonly __is_human_ctrl__ = true;
  override player: PlayerInfo;
  constructor(player_id: string, entity: Entity) {
    super(player_id, entity);
    this.player = this.lfw.player(player_id)
  }
}
