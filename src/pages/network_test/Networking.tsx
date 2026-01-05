
import { Labels, LF2, LF2KeyEvent, LGK, PlayerInfo } from "@/LF2";
import { IKeyEvent, IReqGameTick, MsgEnum, TInfo } from "@/Net";
import { useStateRef } from "@fimagine/dom-hooks/dist/useStateRef";
import { useEffect, useRef, useState } from "react";
import { ChatBox } from "./ChatBox";
import { Connection } from "./Connection";
import { ConnectionBox } from "./ConnectionBox";
import { RoomBox } from "./RoomBox";
import { RoomsBox } from "./RoomsBox";
import styles from "./styles.module.scss";
import { TriState } from "./TriState";
import { useRoom } from "./useRoom";
import { useMessageHandler } from "./useMessageHandler";
import { useCallbacks } from "./useCallbacks";
export interface INetworkingProps {
  lf2?: LF2 | undefined | null;
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

      if (!lf2) return;
      const me = conn.player;
      if (!me) return;

      switch (resp.type) {
        case MsgEnum.RoomStart:
          const players = conn.room?.clients
          if (players) {
            for (const player of players) {
              for (let i = 1; i <= 8; i++) {
                const k = `${player.id}#${i}`;
                const pi = new PlayerInfo(k, player.name, false);
                lf2.players.set(k, pi)
              }
            }
          }
          lf2.load("data.zip.json")
          lf2.set_ui("loading")
          lf2.seed(resp.seed ?? 0)
          break;
        case MsgEnum.Tick: {
          const { reqs, seq } = resp
          if (typeof seq !== 'number') break

          lf2.world.after_update = () => lf2.world.sleep()
          lf2.world.before_update = () => {
            const req: TInfo<IReqGameTick> = {
              seq: seq + 1,
              cmds: [...lf2.cmds],
              events: lf2.events.map<IKeyEvent>(r => ({
                client_id: me.id,
                player_id: r.player,
                game_key: r.game_key,
                pressed: r.pressed
              }))
            }
            if (reqs?.length) {
              for (const { cmds, events } of reqs) {
                lf2.cmds.length = 0;
                lf2.events.length = 0;
                if (cmds?.length)
                  lf2.cmds.push(...cmds)
                if (events?.length) {
                  for (const { client_id, player_id, pressed = false, game_key = '' } of events) {
                    if (!client_id) continue;
                    if (!player_id) continue;
                    const gk = game_key as LGK
                    const label = Labels[gk]
                    if (!label) continue;
                    const pid = client_id + '#' + player_id
                    const le = new LF2KeyEvent(pid, pressed, gk, label)
                    lf2.events.push(le)
                  }
                }
              }
            }
            conn.send(MsgEnum.Tick, req)
          }
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