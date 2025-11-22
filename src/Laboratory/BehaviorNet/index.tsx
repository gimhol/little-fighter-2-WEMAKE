import { useCallback, useEffect, useMemo, useRef } from "react";
import { __Render } from "../../DittoImpl";
import FPS from "@/LF2/base/FPS";
import { Behavior } from "../../behavior";
import { Cat } from "./Cat";
import { Creature } from "./Creature";
import { Ground } from "./Ground";
const CANVAS_PADDING = 100;
const GROUND_W = 500;
const GROUND_H = 500;

const cat = new Cat();

const human = new Creature();
human.name = "You";
human.color = "white";
human.pos.x = GROUND_W / 2;
human.pos.y = GROUND_H / 2;

enum HumanBehaviorEnum {
  Moving = "moving",
  Standing = "standing",
}
Behavior.Noding(HumanBehaviorEnum.Standing).actor(human.actor).done();
human.actor.use_behavior(HumanBehaviorEnum.Standing);
Behavior.Connecting(human.actor).done();

const groud = new Ground();
groud.pos.x = CANVAS_PADDING;
groud.pos.y = CANVAS_PADDING;
groud.size.x = GROUND_W;
groud.size.y = GROUND_H;
groud.add_creature(cat, human);

export default function BehaviorNetView() {
  const ref_canvas = useRef<HTMLCanvasElement>(null);
  const ref_ctx = useRef<CanvasRenderingContext2D | null | undefined>(null);
  const ref_pause = useRef(false);
  const ref_time = useRef(0);
  const ref_div_fps = useRef<HTMLDivElement>(null);

  const [fps] = useMemo(() => {
    const fps = new FPS();
    return [fps];
  }, []);

  useEffect(() => {
    ref_ctx.current = ref_canvas.current?.getContext("2d");
  }, []);

  const update_once = useCallback((dt: number) => {
    groud.update(dt);
  }, []);

  const render_once = useCallback(
    (time: number) => {
      const canvas = ref_canvas.current;
      const ctx = ref_ctx.current;
      if (!canvas || !ctx) return;
      const { width, height } = canvas;
      canvas.width = width;
      canvas.height = height;

      const dt = time - ref_time.current;

      if (!ref_pause.current) update_once(dt);
      groud.render(ctx);

      fps.update(time - ref_time.current);
      ref_time.current = time;

      if (ref_div_fps.current)
        ref_div_fps.current.innerText = "" + Math.floor(fps.value);
    },
    [update_once, fps],
  );

  useEffect(() => {
    ref_ctx.current = ref_canvas.current?.getContext("2d");
    const _r_id = __Render.add(render_once);
    const on_mousemove = (e: MouseEvent) => {
      human.pos.x = e.offsetX - CANVAS_PADDING;
      human.pos.y = e.offsetY - CANVAS_PADDING;
    };
    document.addEventListener("mousemove", on_mousemove);
    return () => {
      __Render.del(_r_id);
      document.removeEventListener("mousemove", on_mousemove);
    };
  }, [render_once]);

  return (
    <div>
      <canvas
        style={{ cursor: "none" }}
        ref={ref_canvas}
        width={2 * CANVAS_PADDING + GROUND_W + 1}
        height={2 * CANVAS_PADDING + GROUND_H + 1}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
