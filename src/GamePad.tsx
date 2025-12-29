import { useEffect, useRef, useState } from "react";
import { IToggleImgProps, ToggleImgButton } from "./Component/Buttons/ToggleImgButton";
import styles from "./GamePad.module.scss";
import { LF2 } from "./LF2/LF2";
import { BaseController } from "./LF2/controller/BaseController";
import { GameKey } from "./LF2/defines/GameKey";
import img_touch_btn_arrow from "./assets/touch_btn_arrow.png";
import img_touch_btn_a from "./assets/touch_btn_a.png";
import img_touch_btn_j from "./assets/touch_btn_j.png";
import img_touch_btn_d from "./assets/touch_btn_d.png";
import { LF2KeyEvent } from "./LF2/ui/LF2KeyEvent";
export interface IGamePadProps extends React.HTMLAttributes<HTMLDivElement> {
  lf2?: LF2;
  player_id?: string;
}
type TRect = { l: number; r: number; t: number; b: number };
type TCirc = { x: number; y: number; r: number };
const get_rect = (ele: React.RefObject<HTMLButtonElement | null>): TRect => {
  if (!ele.current) return { l: 0, t: 0, r: 0, b: 0 };
  const { x, y, width, height } = ele.current.getBoundingClientRect();
  return { l: x, t: y, r: x + width, b: y + height };
};
const get_circ = (ele: React.RefObject<HTMLButtonElement | null>): TCirc => {
  if (!ele.current) return { x: 0, y: 0, r: 0 };
  const { x, y, width, height } = ele.current.getBoundingClientRect();
  return { x: x + width / 2, y: y + height / 2, r: width / 2 };
};
function copy_touch(touch: Touch) {
  return {
    id: touch.identifier,
    x: touch.pageX,
    y: touch.pageY,
    r: Math.max(touch.radiusX, touch.radiusY, 20),
    end: false,
  };
}
export default function GamePad(props: IGamePadProps) {
  const { player_id, lf2, ..._p } = props;
  const [controller, set_controller] = useState<BaseController | undefined>(
    void 0,
  );
  const ref_btn_U = useRef<HTMLButtonElement | null>(null);
  const ref_btn_D = useRef<HTMLButtonElement | null>(null);
  const ref_btn_L = useRef<HTMLButtonElement | null>(null);
  const ref_btn_R = useRef<HTMLButtonElement | null>(null);
  const ref_btn_a = useRef<HTMLButtonElement | null>(null);
  const ref_btn_j = useRef<HTMLButtonElement | null>(null);
  const ref_btn_d = useRef<HTMLButtonElement | null>(null);
  const ref_left_pad = useRef<HTMLDivElement>(null);
  const ref_right_pad = useRef<HTMLDivElement>(null);
  const ref_pad_text = useRef<HTMLDivElement>(null);
  const [refresh_tag, set_refresh_tag] = useState(0);
  useEffect(() => {
    if (!lf2 || !player_id) return;
    return lf2.world.callbacks.add({
      on_player_character_add(add_player_id) {
        if (add_player_id !== player_id) return;
        set_controller(lf2.world.slot_fighters.get(player_id)?.ctrl);
      },
      on_player_character_del(del_player_id) {
        if (del_player_id !== player_id) return;
        set_controller(void 0);
      },
    });
  }, [lf2, player_id]);

  const left_pad = ref_left_pad.current;
  const right_pad = ref_right_pad.current;

  useEffect(() => {
    if (!left_pad || !right_pad) return;
    const on_resize = () => {
      {
        const btns = [
          ref_btn_U.current,
          ref_btn_D.current,
          ref_btn_L.current,
          ref_btn_R.current,
        ];
        let l: number = Infinity,
          r: number = 0,
          b: number = 0,
          t: number = Infinity;
        for (const { x, y, width, height } of btns.map(
          (v) =>
            v?.getBoundingClientRect() || { x: 0, y: 0, width: 0, height: 0 },
        )) {
          l = Math.min(l, x);
          t = Math.min(t, y);
          r = Math.max(r, x + width);
          b = Math.max(b, y + height);
        }
        left_pad.style.left = l + "px";
        left_pad.style.width = r - l + "px";
        left_pad.style.top = t + "px";
        left_pad.style.height = b - t + "px";
      }
      {
        const btns = [ref_btn_a.current, ref_btn_j.current, ref_btn_d.current];
        let l: number = Infinity,
          r: number = 0,
          b: number = 0,
          t: number = Infinity;
        for (const { x, y, width, height } of btns.map(
          (v) =>
            v?.getBoundingClientRect() || { x: 0, y: 0, width: 0, height: 0 },
        )) {
          l = Math.min(l, x);
          t = Math.min(t, y);
          r = Math.max(r, x + width);
          b = Math.max(b, y + height);
        }
        right_pad.style.left = l + "px";
        right_pad.style.width = r - l + "px";
        right_pad.style.top = t + "px";
        right_pad.style.height = b - t + "px";
      }
      set_refresh_tag((v) => v + 1);
    };
    on_resize();
    window.addEventListener("resize", on_resize);
    return () => window.removeEventListener("contextmenu", on_resize);
  }, [left_pad, right_pad]);

  useEffect(() => {
    if (!player_id || !lf2 || !left_pad) return;
    const pad = left_pad;
    const btn_infos = [
      { key: GameKey.U, rect: get_rect(ref_btn_U), circ: get_circ(ref_btn_U) },
      { key: GameKey.D, rect: get_rect(ref_btn_D), circ: get_circ(ref_btn_D) },
      { key: GameKey.L, rect: get_rect(ref_btn_L), circ: get_circ(ref_btn_L) },
      { key: GameKey.R, rect: get_rect(ref_btn_R), circ: get_circ(ref_btn_R) },
    ];
    const prev_pressings = new Map([
      [GameKey.L, false],
      [GameKey.R, false],
      [GameKey.U, false],
      [GameKey.D, false],
    ]);
    const touches: ReturnType<typeof copy_touch>[] = [];
    const find_touch_index = (touch_id: number) => {
      return touches.findIndex((v) => v.id === touch_id);
    };
    const pad_text = ref_pad_text.current;
    if (!pad_text) return;
    const handle_touchs = () => {
      const curr_pressings = new Map([
        [GameKey.L, false],
        [GameKey.R, false],
        [GameKey.U, false],
        [GameKey.D, false],
      ]);
      for (const t of touches) {
        for (const { circ, key: k } of btn_infos) {
          curr_pressings.set(
            k,
            Math.pow(circ.x - t.x, 2) + Math.pow(circ.y - t.y, 2) <
            Math.pow(t.r + circ.r, 2),
          );
        }
      }
      for (const [k, v] of curr_pressings) {
        if (v === prev_pressings.get(k)) continue;
        if (v) {
          lf2.events.push(new LF2KeyEvent(player_id, true, k, k));
          controller?.start(k);
          if (pad_text.innerText.length > 10)
            pad_text.innerText = pad_text.innerText.substring(2);
          pad_text.innerText += k + "⬇";
        } else {
          lf2.events.push(new LF2KeyEvent(player_id, false, k, k));
          controller?.end(k);
          if (pad_text.innerText.length > 10)
            pad_text.innerText = pad_text.innerText.substring(2);
          pad_text.innerText += k + "⬆";
        }
        prev_pressings.set(k, v);
      }
    };
    const on_touch_start = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of e.changedTouches) touches.push(copy_touch(t));
      handle_touchs();
    };
    const on_touch_move = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        const idx = find_touch_index(t.identifier);
        if (idx >= 0) touches.splice(idx, 1, copy_touch(t));
      }
      handle_touchs();
    };
    const on_touch_end = (e: TouchEvent) => {
      for (const t of e.changedTouches) {
        const idx = find_touch_index(t.identifier);
        if (idx >= 0) touches.splice(idx, 1);
      }
      handle_touchs();
    };
    pad.addEventListener("touchstart", on_touch_start, { passive: false });
    pad.addEventListener("touchmove", on_touch_move, { passive: false });
    pad.addEventListener("touchend", on_touch_end, { passive: false });
    pad.addEventListener("touchcancel", on_touch_end, { passive: false });

    return () => {
      pad.removeEventListener("touchstart", on_touch_start);
      pad.removeEventListener("touchmove", on_touch_move);
      pad.removeEventListener("touchend", on_touch_end);
      pad.removeEventListener("touchcancel", on_touch_end);
    };
  }, [controller, lf2, player_id, refresh_tag, left_pad]);

  useEffect(() => {
    if (!player_id || !lf2 || !right_pad) return;

    const pad = right_pad;
    const btn_infos = [
      { key: GameKey.a, rect: get_rect(ref_btn_a), circ: get_circ(ref_btn_a) },
      { key: GameKey.j, rect: get_rect(ref_btn_j), circ: get_circ(ref_btn_j) },
      { key: GameKey.d, rect: get_rect(ref_btn_d), circ: get_circ(ref_btn_d) },
    ];
    const prev_pressings = new Map([
      [GameKey.a, false],
      [GameKey.j, false],
      [GameKey.d, false],
    ]);
    const touches: ReturnType<typeof copy_touch>[] = [];
    const find_touch_index = (touch_id: number) => {
      return touches.findIndex((v) => v.id === touch_id);
    };
    const pad_text = ref_pad_text.current;
    if (!pad_text) return;
    const handle_touchs = () => {
      const curr_pressings = new Map([
        [GameKey.a, false],
        [GameKey.j, false],
        [GameKey.d, false],
      ]);
      for (const t of touches) {
        for (const { circ, key: k } of btn_infos) {
          curr_pressings.set(
            k,
            Math.pow(circ.x - t.x, 2) + Math.pow(circ.y - t.y, 2) <
            Math.pow(t.r + circ.r, 2),
          );
        }
      }
      for (const [k, v] of curr_pressings) {
        if (v === prev_pressings.get(k)) continue;
        if (v) {
          lf2.events.push(new LF2KeyEvent(player_id, true, k, k));
          controller?.start(k);
          if (pad_text.innerText.length > 10)
            pad_text.innerText = pad_text.innerText.substring(2);
          pad_text.innerText += k + "⬇";
        } else {
          lf2.events.push(new LF2KeyEvent(player_id, false, k, k));
          controller?.end(k);
          if (pad_text.innerText.length > 10)
            pad_text.innerText = pad_text.innerText.substring(2);
          pad_text.innerText += k + "⬆";
        }
        prev_pressings.set(k, v);
      }
    };
    const on_touch_start = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of e.changedTouches) touches.push(copy_touch(t));
      handle_touchs();
    };
    const on_touch_move = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        const idx = find_touch_index(t.identifier);
        if (idx >= 0) touches.splice(idx, 1, copy_touch(t));
      }
      handle_touchs();
    };
    const on_touch_end = (e: TouchEvent) => {
      for (const t of e.changedTouches) {
        const idx = find_touch_index(t.identifier);
        if (idx >= 0) touches.splice(idx, 1);
      }
      handle_touchs();
    };
    pad.addEventListener("touchstart", on_touch_start, { passive: false });
    pad.addEventListener("touchmove", on_touch_move, { passive: false });
    pad.addEventListener("touchend", on_touch_end, { passive: false });
    pad.addEventListener("touchcancel", on_touch_end, { passive: false });

    return () => {
      pad.removeEventListener("touchstart", on_touch_start);
      pad.removeEventListener("touchmove", on_touch_move);
      pad.removeEventListener("touchend", on_touch_end);
      pad.removeEventListener("touchcancel", on_touch_end);
    };
  }, [controller, lf2, player_id, refresh_tag, right_pad]);
  if (!player_id) return <></>;
  const touch_props = (key: GameKey): IToggleImgProps => {
    return {
      style: { pointerEvents: "none" },
      disabled: true,
    };
  };
  return (
    <div {..._p}>
      <div className={styles.pad_text} ref={ref_pad_text} />
      <div className={styles.left_pad} ref={ref_left_pad}>
        <ToggleImgButton
          className={styles.btn_up}
          ref={ref_btn_U}
          {...touch_props(GameKey.U)}
          src={[img_touch_btn_arrow]}
          alt="up"
          draggable={false}
        />
        <ToggleImgButton
          className={styles.btn_down}
          ref={ref_btn_D}
          {...touch_props(GameKey.D)}
          src={[img_touch_btn_arrow]}
          alt="down"
          draggable={false}
        />
        <ToggleImgButton
          className={styles.btn_left}
          ref={ref_btn_L}
          {...touch_props(GameKey.L)}
          src={[img_touch_btn_arrow]}
          alt="left"
          draggable={false}
        />
        <ToggleImgButton
          className={styles.btn_right}
          ref={ref_btn_R}
          {...touch_props(GameKey.R)}
          src={[img_touch_btn_arrow]}
          alt="right"
          draggable={false}
        />
      </div>
      <div className={styles.right_pad} ref={ref_right_pad}>
        <ToggleImgButton
          className={styles.btn_attack}
          ref={ref_btn_a}
          {...touch_props(GameKey.a)}
          src={[img_touch_btn_a]}
          alt="attack"
          draggable={false}
        />
        <ToggleImgButton
          className={styles.btn_jump}
          ref={ref_btn_j}
          {...touch_props(GameKey.j)}
          src={[img_touch_btn_j]}
          alt="jump"
          draggable={false}
        />
        <ToggleImgButton
          className={styles.btn_defense}
          ref={ref_btn_d}
          {...touch_props(GameKey.d)}
          src={[img_touch_btn_d]}
          alt="defense"
          draggable={false}
        />
      </div>
    </div>
  );
}
