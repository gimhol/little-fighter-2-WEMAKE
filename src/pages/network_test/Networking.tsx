
import { LF2, LF2KeyEvent, LGK, PlayerInfo } from "@/LF2";
import { bot_action_cases, mt_cases } from "@/LF2/cases_instances";
import { IKeyEvent, IReqTick, IRespRoomStart, IRespTick, MsgEnum, TInfo } from "@/Net";
import { IRespKeyTick } from "@/Net/IMsg_KeyTick";
import { useStateRef } from "@fimagine/dom-hooks/dist/useStateRef";
import { useMemo, useRef, useState } from "react";
import { ChatBox } from "./ChatBox";
import { Connection } from "./Connection";
import { ConnectionBox } from "./ConnectionBox";
import { RoomBox } from "./RoomBox";
import { RoomsBox } from "./RoomsBox";
import styles from "./styles.module.scss";
import { TriState } from "./TriState";
import { useCallbacks } from "./useCallbacks";
import { useRoom } from "./useRoom";
export interface INetworkingProps {
  lf2?: LF2 | undefined | null;
}

class Tester<V> {
  private s = false
  private v1: V;
  private v0: V;
  private comparer = (a: V, b: V) => a === b;
  constructor(first: V, comparer?: typeof this.comparer) {
    this.v1 = this.v0 = first;
    if (comparer) this.comparer = comparer;
  }
  reset() {
    this.v1 = this.v0;
    this.s = false
  }
  test(value: V): boolean {
    if (!this.s) {
      this.s = true;
      this.v1 = value;
      return true;
    }
    return this.v1 === value
  }
}

class Lf2NetworkDriver {
  conn?: Connection | null;
  lf2?: LF2 | null;
  resp?: IRespTick | IRespKeyTick | null;
  _f: boolean = false;
  _r = new Tester<string | null | undefined>(null);
  _p = new Tester<string | null | undefined>(null);
  _a = new Tester<string | null | undefined>(null);
  on_room_start(resp: IRespRoomStart) {
    const { conn, lf2 } = this;
    if (!conn || !lf2) return;
    const clients = conn.room?.clients
    if (clients?.length) {
      for (const client of clients) {
        for (let i = 1; i <= 4; i++) {
          const k = `${client.id}#${i}`;
          const pi = new PlayerInfo(k, client.name, false);
          lf2.players.set(k, pi)
        }
      }
    }
    lf2.load("data.zip.json")
    lf2.set_ui("loading")
    lf2.mt.reset(resp.seed ?? 0, true)
    bot_action_cases.debug(true);
    mt_cases.debug(true)
  }
  on_tick(resp: IRespTick | IRespKeyTick) {
    const { conn, lf2 } = this;
    if (!conn || !lf2) return;
    if (typeof resp.seq !== 'number') return;
    if (resp.seq === 0) {
      lf2.world.after_update = this.after_update
      lf2.world.before_update = this.before_update
    }
    this.resp = resp;
    lf2.world.awake()
  }
  before_update = () => {
    const { lf2, conn, resp } = this;
    if (!lf2 || !conn || !resp) return;
    const { reqs, seq } = resp
    const me = conn.player;
    if (!me || typeof seq !== 'number' || !reqs?.length) return;
    const req_events: IKeyEvent[] = lf2.events.map<IKeyEvent>(r => ({
      client_id: me.id,
      player_id: me.id + '#' + r.player,
      game_key: r.game_key,
      pressed: r.pressed,
    }))
    const req: TInfo<IReqTick> = {
      seq: seq + 1,
      cmds: lf2.cmds,
      events: req_events
    }
    if (mt_cases.debuging) req._r = mt_cases.submit()
    if (mt_cases.debuging) req._p = Array.from(lf2.world.entities).map(e => `(${e.position.x}, ${e.position.y}, ${e.position.z})`).join(', ')
    if (bot_action_cases.debuging) req._a = bot_action_cases.submit();
    if (!this._f) conn.send(MsgEnum.Tick, req);
    lf2.cmds.length = 0;
    lf2.events.length = 0;
    this._p.reset()
    this._r.reset()
    this._a.reset()
    for (const req of reqs) {
      const { cmds, events, _r, _p, _a } = req;
      if (!this._a.test(_a)) {
        console.error(`bot acations not equal!`, reqs.map(v => v._a))
        this._f = true
      }
      if (!this._r.test(_r)) {
        console.error(`randoms not equal!`, reqs.map(v => v._r))
        this._f = true
      }
      if (!this._p.test(_p)) {
        console.error(`posiitons not equal!`, reqs.map(v => v._p))
        this._f = true
      }
      if (this._f) { debugger; break; }
      if (cmds?.length) lf2.cmds.push(...(cmds as any[]))
      if (!events?.length) continue;
      for (const { player_id, pressed = false, game_key = '' } of events) {
        if (!player_id) continue;
        const gk = game_key as LGK
        const le = new LF2KeyEvent(player_id, pressed, gk, gk)
        lf2.events.push(le)
      }
    }
  }
  after_update = () => this.lf2?.world.sleep()
}


export function Networking(props: INetworkingProps) {
  const { lf2 } = props;
  const ref_lf2 = useRef(lf2);
  ref_lf2.current = lf2;
  const [conn_state, set_conn_state] = useState<TriState>(TriState.False);
  const [conn, set_conn] = useStateRef<Connection | null>(null)
  const { room } = useRoom(conn)
  const updater = useMemo(() => new Lf2NetworkDriver(), [])
  updater.conn = conn;
  updater.lf2 = lf2;
  const [started, set_started] = useState(false)
  useCallbacks(conn?.callbacks, {
    on_message: (resp, conn) => {
      const me = conn.player;
      if (!lf2 || !me) return;
      switch (resp.type) {
        case MsgEnum.RoomStart:
          updater.on_room_start(resp);
          set_started(true)
          break;
        case MsgEnum.KeyTick:
        case MsgEnum.Tick: {
          updater.on_tick(resp);
          break;
        }
      }
    }
  }, [lf2])

  useCallbacks(lf2?.callbacks, {
    on_loading_end: () => {
      if (!lf2 || !conn) return;
      if (lf2.zips.length < 1) return;
      conn?.send(MsgEnum.Tick, { seq: 0 });
    }
  }, [lf2, conn])


  return <>
    <ConnectionBox
      on_conn_change={set_conn}
      on_state_change={set_conn_state}
      className={styles.rooms_box}
      style={display_or_not(!conn_state)} />
    <RoomsBox
      conn={conn}
      conn_state={conn_state}
      style={display_or_not(conn_state && !room)} />
    <RoomBox
      conn={conn}
      className={styles.rooms_box}
      style={display_or_not(conn_state && room && !started)} />
    <ChatBox
      conn={conn}
      className={styles.chat_box}
      style={display_or_not(conn_state)} />
  </>
}


const display_or_not = (v: any) => ({ display: v ? void 0 : 'none' })