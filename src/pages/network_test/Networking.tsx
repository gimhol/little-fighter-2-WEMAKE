
import { LF2, LF2KeyEvent, LGK, PlayerInfo } from "@/LF2";
import { IKeyEvent, IReqTick, IRespTick, MsgEnum, TInfo } from "@/Net";
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
class Lf2Updater {
  conn?: Connection | null;
  lf2?: LF2 | null;
  resp?: IRespTick | IRespKeyTick | null;
  _f: boolean = false;
  _r: string | null | undefined = null;
  _p: string | null | undefined = null;
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
    if (lf2.mt.debug) {
      req.randoms = lf2.mt.cases.join()
      // req.positions = ''
      // for (const e of lf2.world.entities) {
      //   req.positions += `${e.id}(${e.position.x}, ${e.position.y}, ${e.position.z}) `
      // }
      lf2.mt.cases.length = 0;
    }
    if (!this._f) conn.send(MsgEnum.Tick, req)

    lf2.cmds.length = 0;
    lf2.events.length = 0;
    this._p = null
    this._r = null
    for (const { cmds, events, randoms, positions } of reqs) {
      // if (this._p === null) {
      //   this._p = positions
      // } else if (this._p !== positions) {
      //   console.error(`positions not equal!`, reqs)
      //   this._f = true
      // }
      if (this._r === null) {
        this._r = randoms
      } else if (this._r !== randoms) {
        console.error(`randoms not equal!`, reqs)
        this._f = true
      }
      if (this._f) {
        debugger;
        break;
      }
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
  const updater = useMemo(() => new Lf2Updater(), [])
  updater.conn = conn;
  updater.lf2 = lf2;
  const [started, set_started] = useState(false)
  useCallbacks(conn?.callbacks, {
    on_message: (resp, conn) => {
      const me = conn.player;
      if (!lf2 || !me) return;
      switch (resp.type) {
        case MsgEnum.RoomStart:
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
          set_started(true)
          break;
        case MsgEnum.KeyTick:
        case MsgEnum.Tick: {
          if (typeof resp.seq !== 'number') break
          if (resp.seq === 0) {
            lf2.world.after_update = updater.after_update
            lf2.world.before_update = updater.before_update
          }
          updater.resp = resp;
          lf2.world.awake()
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