import cns from "classnames";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useImmer } from "use-immer";
import csses from "./GamePad.module.scss";
import { pow } from "./LF2";
import { LF2 } from "./LF2/LF2";
import { GameKey as GK } from "./LF2/defines/GameKey";
import { LF2KeyEvent } from "./LF2/ui/LF2KeyEvent";
import { __Keyboard } from "./DittoImpl";

export interface IGamePadProps extends React.HTMLAttributes<HTMLDivElement> {
  lf2?: LF2;
  player_id?: string;
  enabled?: boolean;
  container?: () => Element | DocumentFragment | undefined | null
}
type TRect = { l: number; r: number; t: number; b: number };
type TCirc = { x: number; y: number; r: number };
const get_rect = (ele: React.RefObject<HTMLElement | null>): TRect => {
  if (!ele.current) return { l: 0, t: 0, r: 0, b: 0 };
  const { x, y, width, height } = ele.current.getBoundingClientRect();
  return { l: x, t: y, r: x + width, b: y + height };
};
const get_circ = (ele: React.RefObject<HTMLElement | null>): TCirc => {
  if (!ele.current) return { x: 0, y: 0, r: 0 };
  const { x, y, width, height } = ele.current.getBoundingClientRect();
  return {
    x: x + width / 2,
    y: y + height / 2,
    r: width / 2
  };
};
interface ITouchInfo {
  id: number;
  x: number;
  y: number;
  r: number;
  end: boolean;
}
function copy_touch(touch: Touch): ITouchInfo {
  return {
    id: touch.identifier,
    x: touch.pageX,
    y: touch.pageY,
    r: 30, // Math.max(touch.radiusX, touch.radiusY, 20),
    end: false,
  };
}
export default function GamePad(props: IGamePadProps) {
  const { player_id, lf2, enabled, container, ..._p } = props;
  const [pressings, set_pressings] = useImmer<{ [x in GK]?: boolean }>({})
  const ref_btn_U = useRef<HTMLDivElement>(null);
  const ref_btn_D = useRef<HTMLDivElement>(null);
  const ref_btn_L = useRef<HTMLDivElement>(null);
  const ref_btn_R = useRef<HTMLDivElement>(null);
  const ref_btn_a = useRef<HTMLDivElement>(null);
  const ref_btn_j = useRef<HTMLDivElement>(null);
  const ref_btn_d = useRef<HTMLDivElement>(null);
  const ref_left_pad = useRef<HTMLDivElement>(null);
  const ref_right_pad = useRef<HTMLDivElement>(null);
  const ref_pad_text = useRef<HTMLDivElement>(null);
  const [touchs, set_touchs] = useState<ITouchInfo[]>();

  useEffect(() => {
    if (!enabled) return;
    const l_pad = ref_left_pad.current;
    const r_pad = ref_right_pad.current;
    if (!player_id || !lf2 || !l_pad || !r_pad) return;
    const player = lf2.players.get(player_id)
    if (!player) return;
    const btn_infos = [
      { key: GK.U, circ: () => get_circ(ref_btn_U) },
      { key: GK.D, circ: () => get_circ(ref_btn_D) },
      { key: GK.L, circ: () => get_circ(ref_btn_L) },
      { key: GK.R, circ: () => get_circ(ref_btn_R) },
      { key: GK.d, circ: () => get_circ(ref_btn_d) },
      { key: GK.j, circ: () => get_circ(ref_btn_j) },
      { key: GK.a, circ: () => get_circ(ref_btn_a) },
    ];
    const pressings_0 = new Map<GK, boolean>(
      btn_infos.map(v => [v.key, false])
    );
    const pressings_1 = new Map<GK, boolean>();
    const touches: ITouchInfo[] = [];
    const find_touch_index = (touch_id: number) => {
      return touches.findIndex((v) => v.id === touch_id);
    };
    const pad_text = ref_pad_text.current;
    if (!pad_text) return;
    const kb = (lf2.keyboard as __Keyboard);
    const handle_touchs = () => {
      pressings_1.clear();
      for (const { circ, key } of btn_infos) {
        pressings_1.set(key, touches.some(t => {
          const c = circ()
          const xx = pow(c.x - t.x, 2);
          const yy = pow(c.y - t.y, 2);
          const rr = pow(c.r + t.r, 2);
          return xx + yy < rr
        }))
      }
      for (const [key, prev] of pressings_0) {
        if (prev == !!pressings_1.get(key)) continue;
        if (prev) {
          kb.key_up(player.keys[key], 'touch')
        } else {
          kb.key_down(player.keys[key], 'touch')
        }
        if (pad_text.innerText.length > 10)
          pad_text.innerText = pad_text.innerText.substring(3);
        set_pressings(d => { d[key] = !prev })
        pad_text.innerText += ' ' + key + (prev ? "⬆" : "⬇");
        pressings_0.set(key, !prev);
      }
    };
    const touchstart = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of e.changedTouches) touches.push(copy_touch(t));
      set_touchs([...touches])
      handle_touchs();
    };
    const touchmove = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        const idx = find_touch_index(t.identifier);
        if (idx >= 0) touches[idx] = copy_touch(t);
      }
      set_touchs([...touches])
      handle_touchs();
    };
    const touchend = (e: TouchEvent) => {
      for (const t of e.changedTouches) {
        const idx = find_touch_index(t.identifier);
        if (idx >= 0) touches.splice(idx, 1);
      }
      set_touchs([...touches])
      handle_touchs();
    };

    l_pad.addEventListener("touchstart", touchstart, { passive: false });
    l_pad.addEventListener("touchmove", touchmove, { passive: false });
    l_pad.addEventListener("touchend", touchend, { passive: false });
    l_pad.addEventListener("touchcancel", touchend, { passive: false });
    r_pad.addEventListener("touchstart", touchstart, { passive: false });
    r_pad.addEventListener("touchmove", touchmove, { passive: false });
    r_pad.addEventListener("touchend", touchend, { passive: false });
    r_pad.addEventListener("touchcancel", touchend, { passive: false });

    return () => {
      l_pad.removeEventListener("touchstart", touchstart);
      l_pad.removeEventListener("touchmove", touchmove);
      l_pad.removeEventListener("touchend", touchend);
      l_pad.removeEventListener("touchcancel", touchend);
      r_pad.removeEventListener("touchstart", touchstart);
      r_pad.removeEventListener("touchmove", touchmove);
      r_pad.removeEventListener("touchend", touchend);
      r_pad.removeEventListener("touchcancel", touchend);
    };
  }, [lf2, player_id, enabled]);

  const _c = container?.()
  if (!_c || !enabled) return <></>

  return createPortal(
    <div {..._p} className={csses.game_pad}>
      <div className={csses.pad_text} ref={ref_pad_text} />
      <div className={csses.left_pad} ref={ref_left_pad} onContextMenu={e => { e.preventDefault(); e.stopPropagation() }} />
      <div className={csses.right_pad} ref={ref_right_pad} onContextMenu={e => { e.preventDefault(); e.stopPropagation() }} />
      <div className={cns(csses.btn_U, pressings.U ? csses.pressing : void 0)} ref={ref_btn_U} />
      <div className={cns(csses.btn_D, pressings.D ? csses.pressing : void 0)} ref={ref_btn_D} />
      <div className={cns(csses.btn_L, pressings.L ? csses.pressing : void 0)} ref={ref_btn_L} />
      <div className={cns(csses.btn_R, pressings.R ? csses.pressing : void 0)} ref={ref_btn_R} />
      <div className={cns(csses.btn_a, pressings.a ? csses.pressing : void 0)} ref={ref_btn_a} />
      <div className={cns(csses.btn_j, pressings.j ? csses.pressing : void 0)} ref={ref_btn_j} />
      <div className={cns(csses.btn_d, pressings.d ? csses.pressing : void 0)} ref={ref_btn_d} />
      {touchs?.map(touch => (
        <div
          key={touch.id}
          className={csses.touch_circle}
          style={{ left: touch.x, top: touch.y }}>
          {touch.id}
        </div>
      ))}
    </div>
    , _c);
}
