import { ForwardedRef, forwardRef, HTMLAttributes, useEffect, useMemo, useRef, useState } from "react";
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
import { useTranslation } from "react-i18next";
import { Input } from "@/Component/Input";
import { useCallbacks } from "./useCallbacks";
export interface IRoomBoxProps extends HTMLAttributes<HTMLDivElement> {
  conn?: Connection | null
}
export function _RoomBox(props: IRoomBoxProps, f_ref: ForwardedRef<HTMLDivElement>) {
  const { conn, ..._p } = props;
  const { room } = useRoom(conn)
  const { players, me, owner, all_ready, is_owner } = useMemo(() => {
    const players = room?.clients ?? []
    const me = players.find(v => v.id == conn?.client?.id) || null;
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
  const ref_rtts = useRef<{ [x in string]?: HTMLSpanElement | null }>({})

  useCallbacks(conn?.callbacks, {
    on_ping: (resp, conn) => {
      if (!resp.client) return
      const el = ref_rtts.current[resp.client];
      if (el) el.innerText = `${conn.rtt}ms`
    }
  }, [])

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
  const { t } = useTranslation()
  return (
    <Frame {..._p} ref={on_ref}>
      <Flex direction='column' align='stretch'>
        <Flex gap={10} align='center' justify='space-between' style={{ margin: 5 }}>
          <Strong>{`${room?.title} (${players?.length}/${room?.max_players})`}</Strong>
        </Flex>
        <Divider />
        {
          room?.owner?.id === conn?.client?.id ?
            <>
              <Input
                size='s'
                prefix={t('password')}
                variants={['no_border']}
                placeholder={t('dont_need_password')}
                onBlur={e => conn?.send(MsgEnum.RoomPwd, { pwd: e.target.value?.trim() })}
              />
              <Divider />
            </> : null
        }
      </Flex>
      <List data={players} itemKey={r => r.id!} styles={{ verticalScrollBarThumb: { backgroundColor: 'rgba(255,255,255,0.3)' } }}>
        {(other, index) => {
          const client_id = '' + other.id
          const is_self = other.id === conn?.client?.id
          return (
            <Flex direction='column' align='stretch' gap={5}>
              <Flex gap={10} align='center' justify='space-between' style={{ margin: 5 }}>
                <Text>
                  {other.name}
                </Text>
                <Text ref={r => { ref_rtts.current[client_id] = r }} />
                <Text style={{ opacity: 0.5, verticalAlign: 'middle' }}>
                  {is_self ? `(${t('yourself')})` : ''}
                  {other.id == room?.owner?.id ? '👑' : ''}
                </Text>
                <Flex align='center'>
                  <Show show={owner?.id === me?.id && !is_self}>
                    <Button
                      variants={['no_border', 'no_round', 'no_shadow']}
                      onClick={() => conn?.send(MsgEnum.Kick, { client_id: other.id })}>
                      {t('kick')}
                    </Button>
                  </Show>
                  <Text> {other.ready ? t('ready_completed') : t('not_ready')} </Text>
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
            {t("counting_down").replace('%1', "" + countdown)}
          </Flex> : null
      }
      <Flex direction='row' align='stretch' justify='space-evenly' gap={5} style={{ margin: 5 }}>
        <Button
          variants={['no_border', 'no_round', 'no_shadow']}
          onClick={() => conn?.send(MsgEnum.ExitRoom, {})}>
          <Text> {t('leave_room')} </Text>
        </Button>
        <Button
          variants={['no_border', 'no_round', 'no_shadow']}
          onClick={() => conn?.send(MsgEnum.ClientReady, { ready: !me?.ready })}>
          {me?.ready ? t('cancal_ready') : t('get_ready')}
        </Button>
      </Flex>
    </Frame>
  )
}


export const RoomBox = forwardRef<HTMLDivElement, IRoomBoxProps>(_RoomBox)

