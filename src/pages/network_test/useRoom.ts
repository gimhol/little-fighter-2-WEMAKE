import { useEffect, useState } from "react";
import { Connection } from "./Connection";

export const useRoom = (conn: Connection | undefined | null) => {
  const [room, set_room] = useState(conn?.room);
  useEffect(() => {
    if (!conn) {
      set_room(void 0);
      return;
    }
    set_room(conn.room);
    const fn = conn.callbacks.add({ on_room_change: r => set_room(r) });
    return () => fn();
  }, [conn]);
  return { room };
};
