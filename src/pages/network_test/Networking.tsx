
import { LF2 } from "@/LF2";
import { MsgEnum } from "@/Net";
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
    on_message: (resp) => {
      switch (resp.type) {
        case MsgEnum.RoomStart:
          lf2?.load("data.zip.json")
          lf2?.set_ui("loading")
          break;
        case MsgEnum.Tick:
          alert(JSON.stringify(resp, null, 2))
          break;
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