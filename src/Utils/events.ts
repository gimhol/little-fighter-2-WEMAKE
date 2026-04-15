/* eslint-disable @typescript-eslint/no-explicit-any */
import { get_fingerprint } from "./fingerprint";

let _prev_location = ''
let _seq = -1


export function submit_visit_event() {
  if (localStorage.getItem('last_admin') == '255') return;
  const curr_location = location.toString();
  if (_prev_location == curr_location) return;
  _prev_location = curr_location
  console.log(curr_location)
  if (curr_location.endsWith(`/#/`)) return;
  if (curr_location.indexOf('#') < 0) return;
  submit_event('visit', {});
}

export function submit_event(type: string, event: any) {
  get_fingerprint().then(r => {
    const headers = {
      'Content-Type': 'application/json',
      "Fingerprint": r.visitorId,
    }
    fetch(`https://gim.ink/api/events/add?type=${type}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...event,
        uri: location.toString(),
        ua: navigator.userAgent,
        seq: ++_seq,
        time: new Date()
      }),
      mode: 'cors',
    })
  })
}

export function submit_click_event<T extends IClickEventData>(target: HTMLElement, must?: Partial<T>) {
  if (localStorage.getItem('last_admin') == '255') return;
  const el = target
  const el_a = el.closest(`a`);
  if (el_a) {
    return submit_event('click', {
      ...base_click_data(el, {
        href: el_a.href.trim() || void 0,
        target: el_a.target.trim() || void 0,
        rel: el_a.rel.trim() || void 0,
        ...must
      })
    })
  }
  const el_btn = el.closest(`button`)
  if (el_btn) {
    return submit_event('click', base_click_data(el_btn, { ...must }))
  }
  if (must) {
    return submit_event('click', base_click_data(target, { ...must }))
  }
}

document.addEventListener(`click`, e => submit_click_event(e.target as HTMLElement), { capture: true });

function base_click_data<T extends IClickEventData>(
  el: HTMLElement,
  output: Partial<T> = {}
) {
  const more: Partial<IClickEventData> = {}
  for (const [key, prop, attr = key] of common_attrs) {
    let value: string | undefined;
    if (prop) value = el[prop]?.toString().trim()
    if (!value) value = el.getAttribute(attr)?.trim()
    if (!value) value = output[key]?.trim()
    more[key] = value
  }
  return Object.assign(output, more)
}
export function create_click_data_props(o: { what?: string } = {}) {
  return { [`data-what`]: o.what }
}

const common_attrs: [keyof IClickEventData, (keyof HTMLElement)?, string?][] = [
  ["el", 'tagName'],
  ["id"],
  ["class"],
  ["style"],
  ["title", void 0, 'data-title'],
  ["what", void 0, 'data-what'],
  ["inner", 'innerText'],
]
export interface IClickEventData {
  el?: string;
  id?: string;
  class?: string;
  style?: string;
  title?: string;
  what?: string;
  inner?: string;
}