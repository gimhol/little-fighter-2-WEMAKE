import type { IReq, IResp } from './_Base';
import type { MsgEnum } from './MsgEnum';
export interface IKeyEvent {
  player_id?: string;
  player?: string;
  game_key?: string;
  pressed?: boolean;
}
export interface IReqGameTick extends IReq<MsgEnum.Tick> {
  player_id?: string;
  player_name?: string;
  seq?: number;
  cmds?: string[];
  events?: IKeyEvent[]
}
export interface IRespGameTick extends IResp<MsgEnum.Tick> {
  seq?: number;
  reqs?: IReqGameTick[];
}
