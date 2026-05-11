import { OID } from "../../defines";
import { BotMaker } from "./BotMaker";

export function make_bot_data_knight(): BotMaker {
  return new BotMaker(OID.Knight).set_dataset({
    w_atk_x: 90,
    j_atk_x: 90,
    d_atk_x: 200,
    r_atk_x: 150,
  })
}

BotMaker.register(OID.Knight, make_bot_data_knight)