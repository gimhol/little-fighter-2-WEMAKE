import type { ITimeout } from "../LF2/ditto/ITimeout";
export const __Timeout: ITimeout = {
  add(handler: () => void, timeout?: number, ...args: any[]) {
    return window.setTimeout(handler, timeout, ...args);
  },
  del(timer_id: number): void {
    return window.clearTimeout(timer_id);
  },
};
