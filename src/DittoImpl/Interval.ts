import type { ITimeout } from "../LF2/ditto/ITimeout";

export const __Interval: ITimeout = {
  add(handler: () => void, timeout?: number, ...args: any[]) {
    return window.setInterval(handler, timeout, ...args);
  },
  del(timer_id: number): void {
    return window.clearInterval(timer_id);
  },
};
