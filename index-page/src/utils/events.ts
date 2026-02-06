/* eslint-disable @typescript-eslint/no-explicit-any */
import { get_fingerprint } from "./fingerprint";

let _prev_location = ''
let _seq = -1
export function submit_visit_event() {
  const curr_location = location.toString();
  if (_prev_location == curr_location) return;
  _prev_location = curr_location
  submit_event('visit', { uri: curr_location });
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
      body: JSON.stringify({ ...event, seq: ++_seq, time: new Date() }),
      mode: 'cors',
    })
  })
}

export function submit_click_event(target: HTMLElement, must?: any) {
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
function base_click_data(el: HTMLElement, output: any = {}) {
  return Object.assign(output, {
    el: el.tagName,
    title: el.title || output.title || void 0,
    what: el.getAttribute('data-wevents') || output.what || void 0,
    inner: el.innerText.trim() || void 0,
  })
}