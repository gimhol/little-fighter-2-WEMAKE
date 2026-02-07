import { Info } from "@/base/Info";
import { fetch_info } from "./fetch_info";

export async function fetch_info_list(url: string, parent: Info | null | undefined, lang: string, init: RequestInit & { histories?: Map<string, Info>; } = {}) {
  const { signal, histories = new Map<string, Info>() } = init;

  const resp = await fetch(url, init);
  const raw_list = await resp.json();
  if (!Array.isArray(raw_list)) throw new Error(`[fetch_info_list] failed, got ${raw_list}`);
  if (signal?.aborted) return;

  const cooked_list: Info[] = [];
  for (const raw_item of raw_list) {
    if (!raw_item) continue;
    if (typeof raw_item === 'object') {
      cooked_list.push(new Info(raw_item, lang, parent));
      continue;
    }
    if (typeof raw_item === 'string') {
      const history_key = `[${lang}]${raw_item}`;
      const history = histories.get(history_key) || await fetch_info(raw_item, parent, lang, { signal });
      cooked_list.push(history);
    }
  }
  return cooked_list;
}
