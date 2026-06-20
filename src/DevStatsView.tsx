import { useMemo, useRef } from "react";
import csses from "./DevStatsView.module.scss";
import type { ILFWCallback, IWorldCallbacks, LFW } from "./LFW";
import { useCallbacks } from "./pages/network_test/useCallbacks";

export interface IDevStatsViewProps {
  lf2?: LFW | null;
}
export function DevStatsView(props: IDevStatsViewProps) {
  const { lf2 } = props;
  const ref_fps = useRef<HTMLDivElement>(null);
  const ref_ups = useRef<HTMLDivElement>(null);
  const ref_loading = useRef<HTMLDivElement>(null);
  const ref_tid = useRef<number>(0);

  useCallbacks(
    lf2?.world.callbacks,
    useMemo<IWorldCallbacks>(() => ({
      on_ups_update: (ups) => {
        ref_ups.current!.innerText = "UPS:" + ups.toFixed(0);
      },
      on_fps_update: (fps) => {
        ref_fps.current!.innerText = "FPS:" + fps.toFixed(0);
      }
    }), [])
  )
  useCallbacks(
    lf2?.callbacks,
    useMemo<ILFWCallback>(() => ({
      on_progress: (content, progress) => {
        ref_loading.current!.innerText = `${content}, ${progress}%`;
        ref_loading.current!.style.transition = ''
        ref_loading.current!.style.opacity = '1'
        window.clearTimeout(ref_tid.current);
        ref_tid.current = window.setTimeout(() => {
          ref_loading.current!.style.transition = 'opacity 150ms'
          ref_loading.current!.style.opacity = '0'
        }, 1000)
      }
    }), [])
  )
  return (
    <div className={csses.dev_stats_view}>
      <div ref={ref_fps} className={csses.dev_stats_view_fps} />
      <div ref={ref_ups} className={csses.dev_stats_view_ups} />
      <div ref={ref_loading} className={csses.dev_stats_view_loading} />
    </div>
  );
}