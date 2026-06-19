import type { TResp } from "@/Net";
import type { DependencyList } from "react";
import { Connection } from "./Connection";
import { useCallbacks } from "./useCallbacks";

export function useMessageHandler(
  conn: Connection | undefined | null,
  fn: (resp: TResp, conn: Connection) => void,
  deps: DependencyList = []
) {
  useCallbacks(conn?.callbacks, { on_message: fn }, deps);
}
