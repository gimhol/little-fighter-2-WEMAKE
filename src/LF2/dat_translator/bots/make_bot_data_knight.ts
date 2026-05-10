import { OID } from "../../defines";
import { BotBuilder } from "./BotBuilder";

export function make_bot_data_knight(): BotBuilder {
  return new BotBuilder(OID.Knight).set_dataset({
    w_atk_x: 90,
    j_atk_x: 90,
    d_atk_x: 200,
    r_atk_x: 150,
  })
}

BotBuilder.register(OID.Knight, make_bot_data_knight)