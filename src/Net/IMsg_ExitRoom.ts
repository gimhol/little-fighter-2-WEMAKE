import type { IReq, IResp } from './_Base';
import type { IClientInfo } from "./IClientInfo";
import type { IRoomInfo } from './IRoomInfo';
import type { MsgEnum } from "./MsgEnum";

export interface IReqExitRoom extends IReq<MsgEnum.ExitRoom> {

}
export interface IRespExitRoom extends IResp<MsgEnum.ExitRoom> {
  client?: IClientInfo;
  room?: IRoomInfo;
}

export interface IReqKick extends IReq<MsgEnum.Kick> {
  client_id?: IClientInfo['id'];
}
export interface IRespKick extends IResp<MsgEnum.Kick> {
  client?: IClientInfo;
  room?: IRoomInfo;
}
