import { useFloating, useForwardedRef, useStateRef } from "@fimagine/dom-hooks";
import classNames from "classnames";
import List from "rc-virtual-list";
import { ForwardedRef, forwardRef, useCallback, useEffect } from "react";
import { Button } from "../../Component/Buttons/Button";
import { Divider } from "../../Component/Divider";
import { Flex } from "../../Component/Flex";
import Frame, { IFrameProps } from "../../Component/Frame";
import Show from "../../Component/Show";
import { Strong, Text } from "../../Component/Text";
import { MsgEnum } from "../../Net";
import { Connection } from "./Connection";
import styles from "./styles.module.scss";
import { TriState } from "./TriState";
import { useRoom } from "./useRoom";
import { useRooms } from "./useRooms";

export interface IRoomsBoxProps extends IFrameProps {
  conn?: Connection | null;
  conn_state?: TriState;
}
function _RoomsBox(props: IRoomsBoxProps, f_ref: ForwardedRef<HTMLDivElement>) {
  const {
    conn = null,
    conn_state = TriState.False,
    className,
    ..._p
  } = props;

  const [room_creating, set_room_creating, ref_room_creating] = useStateRef<boolean>(false);
  const [room_joining, set_room_joining, ref_room_joining] = useStateRef<boolean>(false);
  const { room } = useRoom(conn)
  const { rooms } = useRooms(conn)
  const cls_name = classNames(styles.rooms_box, className)
  const update_rooms = useCallback(() => {
    if (!conn) return;
    conn.send(MsgEnum.ListRooms, {}, { loose: true }).catch(e => { })
  }, [conn])

  useEffect(() => {
    if (!conn || conn_state !== TriState.True || room)
      return;
    update_rooms();
    const c = conn.callbacks.add({
      on_message: (resp) => {
        switch (resp.type) {
          case MsgEnum.ExitRoom:
          case MsgEnum.Kick:
            update_rooms();
            break;
          case MsgEnum.CloseRoom:
            update_rooms();
            break;
        }
      }
    });
    return () => c()
  }, [conn, conn_state === TriState.True, room])

  function create_room() {
    if (
      ref_room_joining.current ||
      ref_room_creating.current
    ) return;
    if (!conn) return;
    set_room_creating(true)
    conn.send(MsgEnum.CreateRoom, {
      min_players: 1,
      max_players: 4,
    }).then((resp) => {
      update_rooms()
    }).catch(e => {
      console.log(e)
    }).finally(() => {
      set_room_creating(false)
    })
  }

  function join_room(roomid: string) {
    if (
      !conn ||
      ref_room_joining.current ||
      ref_room_creating.current
    ) return;
    set_room_joining(true)
    conn.send(MsgEnum.JoinRoom, { roomid }).catch(e => {
      console.log(e)
    }).finally(() => {
      set_room_joining(false)
    })
  }
  const [ref_floating_view, on_ref] = useForwardedRef(f_ref)
  useFloating({
    responser: ref_floating_view.current?.firstElementChild as HTMLElement,
    target: ref_floating_view.current,
    followPercent: true,
  })

  return (
    <Frame {..._p} className={cls_name} ref={on_ref}>
      <Flex gap={10} align='stretch' justify='space-between'>
        <Flex align='center' style={{ flex: 1, paddingLeft: 5, overflow: 'hidden' }} gap={5}>
          <Strong style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>房间列表</Strong>
          <Text style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>{conn?.url}</Text>
        </Flex>
        <Flex>
          <Show show={!room && conn_state && !room_joining && !room_creating}>
            <Button
              variants={['no_border', 'no_round', 'no_shadow']}
              onClick={() => create_room()}>
              创建房间
            </Button>
          </Show>
          <Button
            variants={['no_border', 'no_round', 'no_shadow']}
            onClick={() => update_rooms()} >
            刷新
          </Button>
          <Button
            variants={['no_border', 'no_round', 'no_shadow']}
            onClick={() => conn?.close()} >
            断开连接
          </Button>
        </Flex>
      </Flex>
      {rooms?.length === 0 ?
        <Flex direction='column' align='center' justify='center' style={{ height: 65, opacity: 0.5 }}>
          <Text style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>暂无房间，点击刷新或创建房间</Text>
        </Flex> : <Divider />
      }
      <List
        data={rooms}
        itemKey={r => r.id!}
        itemHeight={65}
        style={{ flex: 1, overflow: 'auto' }}>
        {(r, i) => <>
          <Flex direction='column' align='stretch' gap={5}>
            <Flex gap={10} direction='column' align='stretch' justify='space-between' style={{ padding: 5, boxSizing: 'border-box', height: 64 }}>
              <Flex gap={10}>
                <Strong> 房名: {r.title} </Strong>
                <Text> 人数: {r.clients?.length}/{r.max_players} </Text>
              </Flex>
              <Flex gap={10}>
                <Text style={{ flex: 1 }}> 房主: {r.owner?.name} </Text>
                <Button
                  variants={['no_border', 'no_round', 'no_shadow']}
                  disabled={!!room}
                  onClick={() => join_room(r.id!)}>
                  加入
                </Button>
              </Flex>
            </Flex>
          </Flex>
          <Divider />
          <Show show={i == rooms.length - 1}>
            <Flex direction='column' align='center' justify='center' style={{ opacity: 0.5, padding: 10 }}>
              <Text style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>到底了</Text>
            </Flex>
          </Show>
        </>}
      </List>
    </Frame>
  )
}

export const RoomsBox = forwardRef<HTMLDivElement, IRoomsBoxProps>(_RoomsBox)

