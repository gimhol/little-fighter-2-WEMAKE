import type { IReq, IResp } from "./_Base";
import type { IReqChat, IRespChat } from "./IMsg_Chat";
import type { IReqClientInfo, IRespClientInfo } from "./IMsg_ClientInfo";
import type { IReqClientReady, IRespClientReady } from "./IMsg_ClientReady";
import type { IReqCloseRoom, IRespCloseRoom } from "./IMsg_CloseRoom";
import type { IReqCreateRoom, IRespCreateRoom } from "./IMsg_CreateRoom";
import type { IReqExitRoom, IReqKick, IRespExitRoom, IRespKick } from "./IMsg_ExitRoom";
import type { IReqTick, IRespTick } from "./IMsg_Tick";
import type { IReqJoinRoom, IRespJoinRoom } from "./IMsg_JoinRoom";
import type { IReqKeyTick, IRespKeyTick } from "./IMsg_KeyTick";
import type { IReqListRooms, IRespListRooms } from "./IMsg_ListRooms";
import type { IReqRoomStart, IRespRoomStart } from "./IMsg_RoomStart";
import type { MsgEnum } from "./MsgEnum";
import type { IReqListClients, IRespListClients } from "./IMsg_ListClients";
export interface IMsgReqMap {
  [MsgEnum.ClientInfo]: IReqClientInfo,
  [MsgEnum.CreateRoom]: IReqCreateRoom,
  [MsgEnum.JoinRoom]: IReqJoinRoom,
  [MsgEnum.ClientReady]: IReqClientReady,
  [MsgEnum.RoomStart]: IReqRoomStart,
  [MsgEnum.ExitRoom]: IReqExitRoom,
  [MsgEnum.CloseRoom]: IReqCloseRoom,
  [MsgEnum.ListRooms]: IReqListRooms,
  [MsgEnum.Error]: IReq<MsgEnum.Error>,
  [MsgEnum.Kick]: IReqKick,
  [MsgEnum.Chat]: IReqChat,
  [MsgEnum.Tick]: IReqTick,
  [MsgEnum.KeyTick]: IReqKeyTick,
  [MsgEnum.ListClients]: IReqListClients,
}
export interface IMsgRespMap {
  [MsgEnum.ClientInfo]: IRespClientInfo,
  [MsgEnum.CreateRoom]: IRespCreateRoom,
  [MsgEnum.JoinRoom]: IRespJoinRoom,
  [MsgEnum.ClientReady]: IRespClientReady,
  [MsgEnum.RoomStart]: IRespRoomStart,
  [MsgEnum.ExitRoom]: IRespExitRoom,
  [MsgEnum.JoinRoom]: IRespJoinRoom,
  [MsgEnum.CloseRoom]: IRespCloseRoom,
  [MsgEnum.ListRooms]: IRespListRooms,
  [MsgEnum.Error]: IResp<MsgEnum.Error>,
  [MsgEnum.Kick]: IRespKick,
  [MsgEnum.Chat]: IRespChat,
  [MsgEnum.Tick]: IRespTick,
  [MsgEnum.KeyTick]: IRespKeyTick,
  [MsgEnum.ListClients]: IRespListClients,
}