import type { IReq, IResp } from './_Base';
import type { IClientInfo } from './IClientInfo';
import type { IRoomInfo } from './IRoomInfo';
import type { MsgEnum } from './MsgEnum';

export interface IReqJoinRoom extends IReq<MsgEnum.JoinRoom> {
  roomid?: string;
}
export interface IRespJoinRoom extends IResp<MsgEnum.JoinRoom> {
  room?: IRoomInfo;
  player?: IClientInfo;
}
