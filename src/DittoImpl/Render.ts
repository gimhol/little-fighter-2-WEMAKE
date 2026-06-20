import type { IRender } from "../LFW/ditto";

const handle_req_id_map = new Map<number, number>();
export const __Render: IRender = {
  add(handler: (time: number) => void): number {
    let handle: number;
    let req_id: number;
    const func = (time: number) => {
      handler(time);
      req_id = window.requestAnimationFrame(func);
      handle_req_id_map.set(handle, req_id);
    };
    handle = req_id = window.requestAnimationFrame(func);
    handle_req_id_map.set(handle, req_id);
    return handle;
  },
  del(handle: number): void {
    const req_id = handle_req_id_map.get(handle);
    if (req_id) window.cancelAnimationFrame(req_id);
    handle_req_id_map.delete(handle);
  },
};
