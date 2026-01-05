
import { Labels, LF2, LF2KeyEvent, LGK, PlayerInfo } from "@/LF2";
import { IKeyEvent, IReqGameTick, IRespGameTick, MsgEnum, TInfo } from "@/Net";
import { useStateRef } from "@fimagine/dom-hooks/dist/useStateRef";
import { useRef, useState } from "react";
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
const before_update = (conn: Connection, lf2: LF2, resp: IRespGameTick) => {
  const { reqs, seq } = resp
  const me = conn.player;
  if (!me || typeof seq !== 'number' || !reqs?.length) return;
  const req: TInfo<IReqGameTick> = {
    seq: seq + 1,
    cmds: [...lf2.cmds],
    events: lf2.events.map<IKeyEvent>(r => ({
      client_id: me.id,
      player_id: me.id + '#' + r.player,
      game_key: r.game_key,
      pressed: r.pressed
    }))
  }
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
  conn.send(MsgEnum.Tick, req)
}
export function Networking(props: INetworkingProps) {
  const { lf2 } = props;
  const ref_lf2 = useRef(lf2);
  ref_lf2.current = lf2;
  const [conn_state, set_conn_state] = useState<TriState>(TriState.False);
  const [conn, set_conn] = useStateRef<Connection | null>(null)
  const { room } = useRoom(conn)

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
          break;
        case MsgEnum.Tick: {
          if (typeof resp.seq !== 'number') break
          lf2.world.after_update = () => lf2.world.sleep()
          lf2.world.before_update = () => before_update(conn, lf2, resp)
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
      style={{
        opacity: conn_state ? 0 : 1,
        pointerEvents: conn_state ? 'none' : void 0,
      }} />
    <RoomsBox
      conn={conn}
      conn_state={conn_state}
      style={{
        opacity: (conn_state && !room) ? 1 : 0,
        pointerEvents: (conn_state && !room) ? void 0 : 'none',
      }} />
    <RoomBox
      conn={conn}
      className={styles.rooms_box}
      style={{
        opacity: (conn_state && room) ? 1 : 0,
        pointerEvents: (conn_state && room) ? void 0 : 'none',
      }} />
    <ChatBox
      conn={conn}
      className={styles.chat_box}
      style={{
        opacity: conn_state ? 1 : 0,
        pointerEvents: conn_state ? void 0 : 'none',
      }}
    />
  </>
}