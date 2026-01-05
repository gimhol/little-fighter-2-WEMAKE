import type { IReq, IResp } from './_Base';
import type { IClientInfo } from './IClientInfo';
import type { MsgEnum } from './MsgEnum';

export interface IReqClientReady extends IReq<MsgEnum.ClientReady> {
  ready?: boolean;
}

export interface IRespClientReady extends IResp<MsgEnum.ClientReady> {
  ready?: boolean;
  client?: IClientInfo;
}

