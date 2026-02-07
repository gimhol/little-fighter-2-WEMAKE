import type { Info } from "@/base/Info";
import { useEffect, useState } from "react";
import { fetch_info_list } from "../main/fetch_info_list";


export function useInfoChildren(info: Info | undefined | null) {
  const [loading, set_loading] = useState(false);
  const [children, set_children] = useState<Info[]>(info?.children ?? []);
  useEffect(() => {
    if (!info) { return; }
    const { children, children_url } = info;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (children?.length) { set_children(children ?? []); return; }
    if (!children_url) return;
    const ab = new AbortController();
    set_loading(true);
    fetch_info_list(children_url, info, info.lang, { signal: ab.signal })
      .then(list => {
        if (ab.signal.aborted) return;
        info.children = list;
        set_children(list ?? []);
      }).catch(e => {
        if (ab.signal.aborted) return;
        console.warn(e);
      }).finally(() => {
        if (ab.signal.aborted) return;
        set_loading(false);
      });
    return () => ab.abort();
  }, [info]);
  return [children, loading] as const;
}
