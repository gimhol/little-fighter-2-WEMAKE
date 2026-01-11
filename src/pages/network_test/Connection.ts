import { Callbacks } from "@/LF2/base";
import {
  IClientInfo,
  IConnError, IJob, IMsgReqMap, IMsgRespMap,
  IReq, IResp,
  IRespClientInfo, IRoomInfo, ISendOpts, MsgEnum, req_timeout_error,
  req_unknown_error, resp_error, TInfo, TReq, TResp
} from "../../Net";

export interface IConnectionCallbacks {
  once?: boolean;
  on_open?(conn: Connection): void;
  on_close?(e: CloseEvent, conn: Connection): void;
  on_register?(resp: IRespClientInfo, conn: Connection): void;
  on_error?(error: IConnError, conn: Connection): void;
  on_message?(resp: TResp, conn: Connection): void;
  on_room_change?(room: IRoomInfo | undefined, conn: Connection): void;
  on_rooms_change?(rooms: IRoomInfo[], conn: Connection): void;
}

export class Connection {
  static TAG: string = 'Connection';
  readonly callbacks = new Callbacks<IConnectionCallbacks>()
  protected _pid = 1;
  protected _reopen?: () => void;
  protected _jobs = new Map<string, IJob>();
  protected _ws: WebSocket | null = null;
  protected _client?: IClientInfo;
  protected _players: string[] = []
  protected _nickname: string;
  get client(): IClientInfo | undefined { return this._client }
  get nickname(): string { return this._nickname }
  room?: IRoomInfo;
  rooms: IRoomInfo[] = [];
  get url() { return this._ws?.url }

  constructor(nickname: string = '') {
    this._nickname = nickname;
  }
  set_nickname(nickname: string) {
    this._nickname = nickname;
    if (this._ws?.readyState === this._ws?.OPEN)
      this._submit_client();
  }
  set_players(players: string[]) {
    this._players = [...players];
    if (this._ws?.readyState === this._ws?.OPEN)
      this._submit_client();
  }
  protected _submit_client() {
    this.send(MsgEnum.ClientInfo, {
      name: this._nickname,
      players: this._players,
    }, {
      timeout: 1000
    }).then((resp) => {
      this._client = resp.client;
    }).catch((e) => {
      this.close();
      throw e;
    })
  }
  protected _on_open = () => {
    this.callbacks.emit('on_open')(this)
    this.send(MsgEnum.ClientInfo, {
      name: this._nickname,
      players: this._players,
    }, {
      timeout: 1000
    }).then((resp) => {
      this._client = resp.client;
      this.callbacks.emit('on_register')(resp, this)
    }).catch((e) => {
      this.close();
      throw e;
    })
  }
  protected _on_message = (event: MessageEvent<any>) => {
    // console.log(`[${Connection.TAG}::_on_message]`, event.data);
    try {
      const what = JSON.parse(event.data) as TResp | TReq;
      if ('is_resp' in what) {
        const { pid, code } = what;
        const job = this._jobs.get(pid);
        const err = code ? resp_error(what) : void 0
        if (err) {
          this.callbacks.emit('on_error')(err, this)
        } else {
          this.handle_resp(what)
        }
        if (!job) return;
        this._jobs.delete(pid);
        if (job.timerId) clearTimeout(job.timerId);
        if (code && !job.loose) {
          job.reject(err);
        } else {
          job.resolve(what);
        }
      } else if ('is_req' in what) {
        // TODO: not now
      } else {
        // TODO: should not happen
      }
    } catch (error) {
      console.error(`[${Connection.TAG}::_on_message] 解析消息失败: ${error}`);
      // TODO
    }
  }
  protected _on_close = (e: CloseEvent) => {
    if (this.room)
      this.callbacks.emit('on_room_change')(this.room = void 0, this)
    if (this.rooms.length)
      this.callbacks.emit('on_rooms_change')(this.rooms = [], this)
    this.callbacks.emit('on_close')(e, this)
    this._ws = null;
  }

  open(...args: ConstructorParameters<typeof WebSocket>) {
    switch (this._ws?.readyState) {
      case WebSocket.CONNECTING:
      case WebSocket.OPEN:
      case WebSocket.CLOSING:
        this._ws.close();
        if (this._reopen) this._ws.removeEventListener('close', this._reopen);
        this._reopen = () => this.open(...args)
        this._ws.addEventListener('close', this._reopen, { once: true });
        return;
    }
    this._reopen = void 0;
    this._ws = new WebSocket(...args);
    this._ws.addEventListener('message', this._on_message);
    this._ws.addEventListener('open', this._on_open);
    this._ws.addEventListener('close', this._on_close);
    // this._ws.addEventListener('error', this._on_error);
  }

  close() {
    this._ws?.close()
    this._ws = null
  }

  send<
    T extends MsgEnum,
    Req extends IReq = IMsgReqMap[T],
    Resp extends IResp = IMsgRespMap[T]
  >(type: T, msg: TInfo<Req>, options?: ISendOpts): Promise<Resp> {
    const ws = this._ws;
    if (!ws) return Promise.reject(new Error(`[${Connection.TAG}] not open`))
    const pid = `${++this._pid}`;
    const _req: IReq = { pid, type, is_req: true, ...msg };
    return new Promise<Resp>((resolve, reject) => {
      const timeout = options?.timeout || 0;
      const timerId = timeout > 0 ? setTimeout(() => {
        this._jobs.delete(pid);
        const error = req_timeout_error(_req, timeout)
        this.callbacks.emit('on_error')(error, this)
        reject(error);
      }, timeout) : void 0;

      this._jobs.set(pid, { resolve: resolve as any, timerId, reject, ...options });
      try {
        ws.send(JSON.stringify(_req));
      } catch (e) {
        clearTimeout(timerId)
        const error = req_unknown_error(_req, e as Error)
        this.callbacks.emit('on_error')(error, this)
        reject(error)
      }
    });
  }

  handle_resp(resp: TResp) {
    this.callbacks.emit('on_message')(resp, this)
    switch (resp.type) {
      case MsgEnum.JoinRoom:
      case MsgEnum.CreateRoom:
        this.callbacks.emit('on_room_change')(this.room = resp.room, this)
        break;
      case MsgEnum.CloseRoom:
        this.callbacks.emit('on_room_change')(this.room = void 0, this)
        break;
      case MsgEnum.ExitRoom:
      case MsgEnum.Kick:
        const room = resp.client?.id === this._client?.id ? void 0 : resp.room
        this.callbacks.emit('on_room_change')(this.room = room, this)
        break;
      case MsgEnum.ClientReady: {
        const prev = this.room
        if (prev) {
          const room = { ...prev }
          if (room.clients)
            for (const p of room.clients)
              if (p.id === resp.client?.id)
                p.ready = !!resp.ready;
          if (room.clients) room.clients = [...room.clients]
          this.callbacks.emit('on_room_change')(this.room = room, this)
        }
        break;
      }
      case MsgEnum.ClientInfo: {
        const prev = this.room
        if (prev) {
          const room = { ...prev }
          if (room.clients)
            for (const p of room.clients)
              if (p.id === resp.client?.id)
                Object.assign(p, resp.client)
          if (room.clients) room.clients = [...room.clients]
          this.callbacks.emit('on_room_change')(this.room = room, this)
        }
        break;
      }
      case MsgEnum.ListRooms: {
        this.callbacks.emit('on_rooms_change')(this.rooms = resp.rooms ?? [], this)
        break;
      }
    }
  }
}

