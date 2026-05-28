import { ItrKind } from "../defines";
import { Factory } from "../Factory";
import { Buff_MagicFlute } from "./Buff_MagicFlute";

let _registed = false

export function regist_buffs() {
  if (_registed) return;
  _registed = true;
  Factory.register_buff(ItrKind.MagicFlute, Buff_MagicFlute)
}