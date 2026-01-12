import type { IReq, IResp } from "./_Base";
import type { IClientInfo } from "./IClientInfo";
import type { MsgEnum } from "./MsgEnum";

export interface IReqListClients extends IReq<MsgEnum.ListClients> {

}
export interface IRespListClients extends IResp<MsgEnum.ListClients> {
  clients: IClientInfo[]
}