import { BotVal, EntityVal, IBotAction } from "../../defines";
import { CondMaker } from "../CondMaker";

export interface IEditBotAction {
  (action: IBotAction, cond: CondMaker<BotVal | EntityVal>): IBotAction;
}
export interface IEditBotActionFunc {
  (e?: IEditBotAction): IBotAction
}