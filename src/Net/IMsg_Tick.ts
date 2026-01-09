import type { IReq, IResp } from './_Base';
import type { MsgEnum } from './MsgEnum';
export interface IKeyEvent {
  client_id?: string;
  player_id?: string;
  game_key?: string;
  pressed?: boolean;
}
export interface IReqTick extends IReq<MsgEnum.Tick> {
  client_id?: string;
  client_name?: string;
  seq?: number;
  cmds?: string[];
  events?: IKeyEvent[];
  _r?: string;
  _p?: string;
  _a?: string;
}
export interface IRespTick extends IResp<MsgEnum.Tick> {
  seq?: number;
  reqs?: IReqTick[];
}
