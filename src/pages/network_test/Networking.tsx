
import { Labels, LF2, LF2KeyEvent, LGK, PlayerInfo } from "@/LF2";
import { IKeyEvent, IReqGameTick, IRespGameTick, MsgEnum, TInfo } from "@/Net";
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
  resp?: IRespGameTick | null;
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
      pressed: r.pressed
    }))
    const req: TInfo<IReqGameTick> = {
      seq: seq + 1,
      cmds: lf2.cmds,
      events: req_events
    }
    conn.send(MsgEnum.Tick, req)
    for (const { cmds, events } of reqs) {
      lf2.cmds.length = 0;
      lf2.events.length = 0;
      if (cmds?.length) lf2.cmds.push(...cmds)
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
          lf2.seed(resp.seed ?? 0)
          set_started(true)
          break;
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