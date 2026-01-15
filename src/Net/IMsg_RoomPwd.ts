import type { IReq, IResp } from "./_Base";
import type { IClientInfo } from "./IClientInfo";
import type { MsgEnum } from "./MsgEnum";

export interface IReqRoomPwd extends IReq<MsgEnum.RoomPwd> {
  pwd: string;
}
export interface IRespRoomPwd extends IResp<MsgEnum.RoomPwd> {

}