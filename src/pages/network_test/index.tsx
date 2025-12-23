
import { useStateRef } from "@fimagine/dom-hooks/dist/useStateRef";
import { useState } from "react";
import { ChatBox } from "./ChatBox";
import { Connection } from "./Connection";
import { ConnectionBox } from "./ConnectionBox";
import { RoomBox } from "./RoomBox";
import { RoomsBox } from "./RoomsBox";
import styles from "./styles.module.scss";
import { TriState } from "./TriState";
import { useRoom } from "./useRoom";

function Player() {
  const [conn_state, set_conn_state] = useState<TriState>(TriState.False);
  const [conn, set_conn] = useStateRef<Connection | null>(null)
  const { room } = useRoom(conn)
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

export default function NetworkTest() {
  return <Player />
}