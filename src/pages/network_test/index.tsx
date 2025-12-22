
import { useStateRef } from "@fimagine/dom-hooks/dist/useStateRef";
import List from "rc-virtual-list";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../Component/Buttons/Button";
import { Divider } from "../../Component/Divider";
import { Flex } from "../../Component/Flex";
import Frame from "../../Component/Frame";
import Show from "../../Component/Show";
import { Space } from "../../Component/Space";
import { Strong, Text } from "../../Component/Text";
import { MsgEnum } from "../../Net";
import { ChatBox } from "./ChatBox";
import { Connection } from "./Connection";
import { ConnectionBox } from "./ConnectionBox";
import { RoomsBox } from "./RoomsBox";
import styles from "./styles.module.scss";
import { TriState } from "./TriState";
import { useRoom } from "./useRoom";

function Player() {
  const [conn_state, set_conn_state] = useState<TriState>(TriState.False);
  const [conn, set_conn, ref_conn] = useStateRef<Connection | null>(null)
  const { room } = useRoom(conn)
  const [countdown, set_countdown] = useState(5);

  const { players, me, owner, all_ready, is_owner } = useMemo(() => {
    const players = room?.players ?? []
    const me = players.find(v => v.id == conn?.player?.id) || null;
    const owner = players.find(v => v.id == room?.owner?.id) || null;
    const all_ready = !!(
      !players.some(v => !v.ready) &&
      room?.min_players &&
      players.length >= room.min_players
    )
    return { players, me, owner, all_ready, is_owner: me === owner } as const
  }, [room])

  useEffect(() => {
    let sec = 5
    set_countdown(sec);
    if (!all_ready) return;
    const tid = setInterval(() => {
      sec -= 1;
      set_countdown(sec);
      if (sec > 0) return;

      clearInterval(tid);
      if (is_owner)
        ref_conn.current?.send(MsgEnum.RoomStart, {})
    }, 1000)
    return () => clearInterval(tid)
  }, [all_ready, is_owner])

  return <>
    <Space style={{ position: 'fixed', right: 0, bottom: 0 }}>
      <Show show={conn_state === TriState.True}>
        <Show show={room}>
          <Frame style={{ padding: 0 }}>
            <Flex direction='column' align='stretch' gap={5}>
              <Flex gap={10} align='center' justify='space-between' style={{ margin: 5 }}>
                <Strong>{`${room?.title} (${players?.length}/${room?.max_players})`}</Strong>
              </Flex>
              <Divider />
            </Flex>
            <List data={players} itemKey={r => r.id!} styles={{ verticalScrollBarThumb: { backgroundColor: 'rgba(255,255,255,0.3)' } }}>
              {(other, index) => {
                const is_self = other.id === conn?.player?.id
                return (
                  <Flex direction='column' align='stretch' gap={5}>
                    <Flex gap={10} align='center' justify='space-between' style={{ margin: 5 }}>
                      <Text >
                        {other.name}
                      </Text>
                      <Text style={{ opacity: 0.5, verticalAlign: 'middle' }}>
                        {is_self ? '(你)' : ''}
                        {other.id == room?.owner?.id ? '👑' : ''}
                      </Text>
                      <Flex align='center'>
                        <Show show={owner?.id === me?.id && !is_self}>
                          <Button
                            variants={['no_border', 'no_round', 'no_shadow']}
                            onClick={() => ref_conn.current?.send(MsgEnum.Kick, { playerid: other.id })}>
                            踢出
                          </Button>
                        </Show>
                        <Text> {other.ready ? '已准备' : '未准备'} </Text>
                      </Flex>
                    </Flex>
                    <Divider />
                  </Flex>
                )
              }}
            </List>
            {
              all_ready ?
                <Flex direction='row' align='stretch' justify='space-evenly' gap={5} style={{ margin: 5 }}>
                  即将开始，倒计时: {countdown}秒
                </Flex> : null
            }
            <Flex direction='row' align='stretch' justify='space-evenly' gap={5} style={{ margin: 5 }}>
              <Button
                variants={['no_border', 'no_round', 'no_shadow']}
                onClick={() => ref_conn.current?.send(MsgEnum.ExitRoom, {})}>
                <Text> 退出房间 </Text>
              </Button>
              <Button
                variants={['no_border', 'no_round', 'no_shadow']}
                onClick={() => ref_conn.current?.send(MsgEnum.PlayerReady, { ready: !me?.ready })}>
                {me?.ready ? '取消准备' : '准备!'}
              </Button>
            </Flex>
          </Frame>
        </Show>
      </Show>
    </Space>
    <ConnectionBox
      on_conn_change={set_conn}
      on_state_change={set_conn_state}
      className={styles.rooms_box}
      style={{
        opacity: conn_state ? 0 : 1,
        pointerEvents: conn_state ? 'none' : void 0,
      }} />
    <ChatBox
      conn={conn}
      className={styles.chat_box}
      style={{
        opacity: conn_state ? 1 : 0,
        pointerEvents: conn_state ? void 0 : 'none',
      }}
    />
    <RoomsBox
      conn={conn}
      conn_state={conn_state}
      style={{
        opacity: conn_state ? 1 : 0,
        pointerEvents: conn_state ? void 0 : 'none',
      }} />
  </>
}

export default function NetworkTest() {
  return <Player />
}