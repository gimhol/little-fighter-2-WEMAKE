import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Vector2 as __Vector2, Vector2 } from "three";
import { Button } from "../../Component/Buttons/Button";
import Combine from "../../Component/Combine";
import { InputNumber, InputRef } from "../../Component/Input";
import Titled from "../../Component/Titled";
import { __Render } from "../../DittoImpl";
import FPS from "@/LF2/base/FPS";
import { QuadTree } from "./QuadTree";
const CANVAS_PADDING = 100;
const WIDTH = 1000;
const HEIGHT = 500;
const CAPACITY = 1;
const MAX_DEPTH = 5;
const INIT_ITEM_COUNT = 100;
const SPD = 5;
const DOT_R = 5;

class Item extends __Vector2 {
  quad_tree_node: QuadTree<Item> | null = null;
  picked: boolean = false;
  v = new __Vector2(
    SPD * Math.random() - 0.5 * SPD,
    SPD * Math.random() - 0.5 * SPD,
  );
  update() {
    const next = this.clone().add(this.v);
    if (next.x < 0 || next.x > WIDTH) {
      this.v.x = -this.v.x;
    }
    if (next.y < 0 || next.y > HEIGHT) {
      this.v.y = -this.v.y;
    }

    this.x += this.v.x;
    this.y += this.v.y;
  }
}

class MyQuadTree extends QuadTree<Item> {
  override children: [MyQuadTree, MyQuadTree, MyQuadTree, MyQuadTree] | null =
    null;
  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    c: number,
    d: number,
  ) {
    super(x, y, w, h, c, d);
    this.contains = (x, y, w, h, i) => {
      const px = Math.floor(i.x);
      const py = Math.floor(i.y);
      const ret = px >= x && px < x + w && py >= y && py < y + h;
      return ret;
    };
    this.node_changed = (i, n) => {
      i.quad_tree_node = n;
    };
    this.new_child = (x, y, w, h, c, d) => new MyQuadTree(x, y, w, h, c, d);
  }
  add_item() {
    const item = new Item(
      this.x + Math.random() * this.w,
      this.y + Math.random() * this.h,
    );
    const node = this.root.insert(item);
    item.quad_tree_node = node;
  }

  update_qt_items() {
    if (this.children) {
      this.children.forEach((c) => c.update_qt_items());
      return;
    }
    for (const item of this.items) {
      item.update();
    }
  }
  draw_qt_rect(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x + 0.5, this.y + 0.5, this.w, this.h);
    ctx.fill();
    if (this.children) {
      this.children[0].draw_qt_rect(ctx);
      this.children[1].draw_qt_rect(ctx);
      this.children[2].draw_qt_rect(ctx);
      this.children[3].draw_qt_rect(ctx);
    }
  }
  draw_qt_items(ctx: CanvasRenderingContext2D) {
    if (this.children) {
      this.children[0].draw_qt_items(ctx);
      this.children[1].draw_qt_items(ctx);
      this.children[2].draw_qt_items(ctx);
      this.children[3].draw_qt_items(ctx);
      return;
    }
    for (const item of this.items) {
      if (item.picked) ctx.fillStyle = "blue";
      else ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.ellipse(item.x, item.y, DOT_R, DOT_R, 0, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(item.x, item.y - DOT_R);
      ctx.lineTo(item.x, item.y + DOT_R);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(item.x - DOT_R, item.y);
      ctx.lineTo(item.x + DOT_R, item.y);
      ctx.stroke();
    }
  }
}

export default function QuadTreeView() {
  const ref_canvas = useRef<HTMLCanvasElement>(null);
  const [pause, set_pause] = useState(false);
  const ref_pick_items = useRef<Item[]>([]);
  const ref_ctx = useRef(ref_canvas.current?.getContext("2d"));
  const ref_pause = useRef(pause);
  const ref_lb_down = useRef(false);
  const ref_mouse_down_pos = useRef(new Vector2());
  const ref_mouse_pos = useRef(new Vector2());
  const ref_buggy_items = useRef<Item[]>([]);
  const ref_input_num_of_add = useRef<InputRef>(null);
  const ref_div_fps = useRef<HTMLDivElement>(null);
  const ref_div_count = useRef<HTMLDivElement>(null);

  const [root_qt, fps] = useMemo(() => {
    const ret = new MyQuadTree(0, 0, WIDTH, HEIGHT, CAPACITY, MAX_DEPTH);
    for (let i = 0; i < INIT_ITEM_COUNT; ++i) {
      ret.add_item();
    }
    const fps = new FPS();
    return [ret, fps];
  }, []);

  const update_once = useCallback(() => {
    root_qt.update();
    root_qt.update_qt_items();
  }, [root_qt]);
  const ref_time = useRef(0);
  const render_once = useCallback(
    (time: number) => {
      const canvas = ref_canvas.current;
      const ctx = ref_ctx.current;
      if (!canvas || !ctx) return;
      const { width, height } = canvas;
      canvas.width = width;
      canvas.height = height;
      ctx.translate(CANVAS_PADDING, CANVAS_PADDING);
      if (!ref_pause.current) {
        update_once();
      }
      fps.update(time - ref_time.current);
      ref_time.current = time;
      if (ref_div_fps.current)
        ref_div_fps.current.innerText = "" + Math.floor(fps.value);
      if (ref_div_count.current)
        ref_div_count.current.innerText = "" + root_qt.item_count;
      root_qt.draw_qt_items(ctx);
      root_qt.draw_qt_rect(ctx);
      if (ref_lb_down.current) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#add8e6";
        const { x: x1, y: y1 } = ref_mouse_down_pos.current;
        const { x: x2, y: y2 } = ref_mouse_pos.current;
        const x = Math.min(x1, x2);
        const y = Math.min(y1, y2);
        const w = Math.abs(x1 - x2);
        const h = Math.abs(y1 - y2);
        ctx.strokeRect(x, y, w, h);
        for (const i of ref_pick_items.current) {
          i.picked = false;
        }
        ref_pick_items.current = root_qt.query(x, y, w, h, []);
        for (const i of ref_pick_items.current) {
          i.picked = true;
        }
      }
    },
    [root_qt, update_once, fps],
  );

  useEffect(() => {
    ref_pause.current = pause;
  }, [pause, render_once]);

  useEffect(() => {
    ref_ctx.current = ref_canvas.current?.getContext("2d");
    const _r_id = __Render.add(render_once);
    const on_mousedown = (e: MouseEvent) => {
      if (e.target !== ref_canvas.current) return;
      if (e.button === 0) {
        ref_lb_down.current = true;
        ref_mouse_pos.current.x = ref_mouse_down_pos.current.x =
          e.offsetX - CANVAS_PADDING;
        ref_mouse_pos.current.y = ref_mouse_down_pos.current.y =
          e.offsetY - CANVAS_PADDING;
      }
    };
    const on_mousemove = (e: MouseEvent) => {
      if (e.target !== ref_canvas.current) return;
      if (ref_lb_down.current) {
        ref_mouse_pos.current.x = e.offsetX - CANVAS_PADDING;
        ref_mouse_pos.current.y = e.offsetY - CANVAS_PADDING;
      }
    };
    const on_mouseup = (e: MouseEvent) => {
      if (e.button === 0) {
        ref_lb_down.current = false;
      }
    };
    document.addEventListener("mousedown", on_mousedown);
    document.addEventListener("mousemove", on_mousemove);
    document.addEventListener("mouseup", on_mouseup);
    return () => {
      __Render.del(_r_id);
      document.removeEventListener("mousedown", on_mousedown);
      document.removeEventListener("mousemove", on_mousemove);
      document.removeEventListener("mouseup", on_mouseup);
    };
  }, [render_once]);
  return (
    <div>
      <div style={{ display: "flex", gap: 5 }}>
        <Titled label="fps:">
          {" "}
          <div ref={ref_div_fps} />{" "}
        </Titled>
        <Titled label="count:">
          {" "}
          <div ref={ref_div_count} />{" "}
        </Titled>
        <InputNumber
          prefix='capacity:'
          placeholder="capacity"
          defaultValue={CAPACITY}
          min={0}
          max={100}
          onChange={(e) => {
            let num = Math.floor(e!);
            if (!num || num < 1) num = 1;
            else if (num > 100) num = 100;
            root_qt.capacity = num;
          }}
        />
        <Combine>
          <InputNumber ref={ref_input_num_of_add} prefix='add:' style={{ width: 100 }} />
          <Button
            onClick={() => {
              const len = Number(ref_input_num_of_add.current?.value);
              if (!len) return;
              for (let i = 0; i < len; i++) {
                root_qt.add_item();
              }
            }}>
            ok
          </Button>
        </Combine>
        <Button
          onClick={() => {
            for (const i of ref_pick_items.current) {
              i.picked = false;
            }
            ref_pick_items.current = root_qt.all_items;
            for (const i of ref_pick_items.current) {
              i.picked = true;
            }
          }}
          shortcut="ctrl+a"
        >
          select all
        </Button>
        <Button
          onClick={() => {
            for (const i of ref_pick_items.current) {
              if (!i.quad_tree_node?.remove(i)) {
                debugger;
              }
            }
            ref_pick_items.current = [];
            root_qt.update();
            root_qt.update_qt_items();
          }}
          shortcut="delete"
        >
          delete picked
        </Button>
        <Button
          onClick={() => {
            console.log(root_qt);
            console.log(ref_buggy_items.current);
          }}
        >
          LOG
        </Button>
        <Button onClick={() => set_pause((v) => !v)}>
          {pause ? "▶️" : "⏸"}
        </Button>
        <Button
          onClick={() => {
            set_pause(true);
            update_once();
          }}
        >
          ⏯️
        </Button>
      </div>
      <canvas
        ref={ref_canvas}
        width={2 * CANVAS_PADDING + root_qt.w + 1}
        height={2 * CANVAS_PADDING + root_qt.h + 1}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
