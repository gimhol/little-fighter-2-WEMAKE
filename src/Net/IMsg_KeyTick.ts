import type { IReq, IResp } from "./_Base";
import type { IReqTick, IRespTick } from "./IMsg_Tick";
import type { MsgEnum } from "./MsgEnum";

export interface IReqKeyTick extends Omit<IReqTick, 'type'>, IReq<MsgEnum.KeyTick> { }
export interface IRespKeyTick extends Omit<IRespTick, 'type'>, IResp<MsgEnum.KeyTick> { }