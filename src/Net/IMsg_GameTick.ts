import type { IReq, IResp } from './_Base';
import type { MsgEnum } from './MsgEnum';
export interface IKeyEvent {
  client_id?: string;
  player_id?: string;
  game_key?: string;
  pressed?: boolean;
}
export interface IReqGameTick extends IReq<MsgEnum.Tick> {
  client_id?: string;
  client_name?: string;
  seq?: number;
  cmds?: string[];
  events?: IKeyEvent[]
}
export interface IRespGameTick extends IResp<MsgEnum.Tick> {
  seq?: number;
  reqs?: IReqGameTick[];
}
