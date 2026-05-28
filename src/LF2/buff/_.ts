import { ItrKind } from "../defines";
import { Factory } from "../Factory";
import { Buff_MagicFlute, Buff_MagicFlute2 } from "./Buff_MagicFlute";

let _registed = false

export function regist_buffs() {
  if (_registed) return;
  _registed = true;
  Factory.register_buff(ItrKind.MagicFlute, Buff_MagicFlute)
  Factory.register_buff(ItrKind.MagicFlute2, Buff_MagicFlute2)
}