import { Button } from "@/Component/Buttons/Button";
import Combine, { ICombineProps } from "@/Component/Combine";
import { Input } from "@/Component/Input";
import { Text } from "@/Component/Text";
import { MsgEnum } from "@/Net/MsgEnum";
import { useFloating } from "@fimagine/dom-hooks/dist/useFloating";
import { useForwardedRef } from "@fimagine/dom-hooks/dist/useForwardedRef";
import { useStateRef } from "@fimagine/dom-hooks/dist/useStateRef";
import { ForwardedRef, forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { Connection } from "./Connection";
import { TriState } from "./TriState";
export interface IConnectionBoxProps extends ICombineProps {
  on_conn_change?(conn: Connection | null): void;
  on_state_change?(conn_state: TriState): void;
}
function _ConnectionBox(props: IConnectionBoxProps, f_ref: ForwardedRef<HTMLDivElement>) {
  const { on_state_change, on_conn_change, ..._p } = props;
  const [ref, on_ref] = useForwardedRef(f_ref)
  useFloating({
    responser: ref.current,
    pivot_x: 0,
    pivot_y: 1,
    followPercent: true,
    is_excluded: e => {
      return e.tagName === 'INPUT' || e.classList.contains(`rc-virtual-list-scrollbar-thumb`)
    }
  })
  const [conn, set_conn, ref_conn] = useStateRef<Connection | null>(null)
  const [address, set_address] = useStateRef('ws://localhost:8080')
  const [nickname, set_nickname] = useStateRef('')
  const [conn_state, set_connected] = useState<TriState>(TriState.False);
  const ref_on_state_change = useRef(on_state_change);
  ref_on_state_change.current = on_state_change;
  const ref_on_conn_change = useRef(on_conn_change);
  ref_on_conn_change.current = on_conn_change;
  useMemo(() => ref_on_conn_change.current?.(conn), [conn])
  useMemo(() => ref_on_state_change.current?.(conn_state), [conn_state])
  function connect() {
    if (ref_conn.current) return;
    const conn = new Connection(nickname);
    set_conn(conn);
  }
  useEffect(() => {
    if (!conn || !address) return;
    conn.open(`${address}`)
    set_connected(TriState.Pending);
    conn.callbacks.once('on_close', (e) => {
      set_connected(TriState.False)
      set_conn(null)
    })
    conn.callbacks.once('on_register', () => set_connected(TriState.True))
    return () => conn?.close()
  }, [conn])
  return (
    <Combine direction='column' {..._p} ref={on_ref}>
      <Input
        style={{ width: '100%' }}
        value={address}
        onChange={set_address}
        disabled={!!conn_state}
        data-flex={1}
        prefix={<Text size='s'>地址:</Text>}
      />
      <Combine>
        <Input
          value={nickname}
          onChange={set_nickname}
          disabled={!!conn_state}
          data-flex={1}
          prefix={<Text size='s'>昵称:</Text>}
        />
        <Button
          disabled={conn_state === TriState.Pending || !address.trim()}
          onClick={connect}>
          {{
            [TriState.False]: 'connect',
            [TriState.Pending]: 'connecting...',
            [TriState.True]: 'disconnect',
          }[conn_state]}
        </Button>
      </Combine>
    </Combine>
  )
}
export const ConnectionBox = forwardRef<HTMLDivElement, IConnectionBoxProps>(_ConnectionBox)

