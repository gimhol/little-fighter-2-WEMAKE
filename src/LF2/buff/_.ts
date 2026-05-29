import { Factory } from "../Factory";
import { Buff_Electroshock } from "./Buff_Electroshock";
import { Buff_MagicFlute, Buff_MagicFlute2 } from "./Buff_MagicFlute";

let _registed = false
export function regist_buffs() {
  if (_registed) return;
  _registed = true;
  Factory.register_buff(Buff_MagicFlute)
  Factory.register_buff(Buff_MagicFlute2)
  Factory.register_buff(Buff_Electroshock)
}