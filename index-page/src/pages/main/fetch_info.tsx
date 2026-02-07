import { Info } from "@/base/Info";

export async function fetch_info(url: string, parent: Info | null | undefined, lang: string, init: RequestInit) {
  const resp = await fetch(url, init);
  const raw = await resp.json();
  if (!raw || typeof raw !== 'object') void 0;
  return new Info(raw, lang, parent);
}
