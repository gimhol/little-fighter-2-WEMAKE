import type { IReq, IResp } from './_Base';
import type { IClientInfo } from './IClientInfo';
import type { MsgEnum } from './MsgEnum';

export interface IReqClientInfo extends IReq<MsgEnum.ClientInfo> {
  name?: string;
  players?: string[];
}
export interface IRespClientInfo extends IResp<MsgEnum.ClientInfo> {
  client?: Required<IClientInfo>;
}
