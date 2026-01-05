import { ForwardedRef, forwardRef, HTMLAttributes, useEffect, useMemo, useState } from "react";
import { Connection } from "./Connection";
import { useRoom } from "./useRoom";
import Frame from "@/Component/Frame";
import { Flex } from "@/Component/Flex";
import { Strong, Text } from "@/Component/Text";
import { Divider } from "@/Component/Divider";
import List from "rc-virtual-list";
import Show from "@/Component/Show";
import { Button } from "@/Component/Buttons/Button";
import { MsgEnum } from "@/Net";
import { useFloating, useForwardedRef } from "@fimagine/dom-hooks";
export interface IRoomBoxProps extends HTMLAttributes<HTMLDivElement> {
  conn?: Connection | null
}
export function _RoomBox(props: IRoomBoxProps, f_ref: ForwardedRef<HTMLDivElement>) {
  const { conn, ..._p } = props;
  const { room } = useRoom(conn)
  const { players, me, owner, all_ready, is_owner } = useMemo(() => {
    const players = room?.clients ?? []
    const me = players.find(v => v.id == conn?.player?.id) || null;
    const owner = players.find(v => v.id == room?.owner?.id) || null;
    const all_ready = !!(
      !players.some(v => !v.ready) &&
      room?.min_players &&
      players.length >= room.min_players
    )
    return { players, me, owner, all_ready, is_owner: me === owner } as const
  }, [room])
  const [countdown, set_countdown] = useState(5);
  const [ref_floating_view, on_ref] = useForwardedRef(f_ref)
  useFloating({
    responser: ref_floating_view.current?.firstElementChild as HTMLElement,
    target: ref_floating_view.current,
    followPercent: true,
  })
  useEffect(() => {
    let sec = 5
    set_countdown(sec);
    if (!all_ready || !conn) return;
    const tid = setInterval(() => {
      sec -= 1;
      set_countdown(sec);
      if (sec > 0) return;

      clearInterval(tid);
      if (is_owner)
        conn?.send(MsgEnum.RoomStart, {})
    }, 1000)
    return () => clearInterval(tid)
  }, [all_ready, conn, is_owner])

  return (
    <Frame {..._p} ref={on_ref}>
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
                      onClick={() => conn?.send(MsgEnum.Kick, { client_id: other.id })}>
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
          onClick={() => conn?.send(MsgEnum.ExitRoom, {})}>
          <Text> 退出房间 </Text>
        </Button>
        <Button
          variants={['no_border', 'no_round', 'no_shadow']}
          onClick={() => conn?.send(MsgEnum.ClientReady, { ready: !me?.ready })}>
          {me?.ready ? '取消准备' : '准备!'}
        </Button>
      </Flex>
    </Frame>
  )
}


export const RoomBox = forwardRef<HTMLDivElement, IRoomBoxProps>(_RoomBox)

