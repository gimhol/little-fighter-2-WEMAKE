import { Entity } from "../entity/Entity";
import { BaseController } from "./BaseController";

export class LocalController
  extends BaseController {
  readonly __is_human_ctrl__ = true;

  constructor(player_id: string, entity: Entity) {
    super(player_id, entity);
    if (!this.player)
      this.player = this.lf2.ensure_player(player_id)
  }
}
export default LocalController;
