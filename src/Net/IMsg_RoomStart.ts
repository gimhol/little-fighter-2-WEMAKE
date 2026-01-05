import type { IReq, IResp } from "./_Base";
import type { MsgEnum } from "./MsgEnum";

export interface IReqRoomStart extends IReq<MsgEnum.RoomStart> { }
export interface IRespRoomStart extends IResp<MsgEnum.RoomStart> { 
  seed: number;
}

