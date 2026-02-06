
import FingerprintJS, { type GetResult } from '@fingerprintjs/fingerprintjs';

let result: GetResult | null = (() => {
  const str = localStorage.getItem('fingerprint')
  if (!str) return null;
  try {
    return JSON.parse(str) as GetResult
  } catch (e: unknown) {
    console.warn(e)
    return null
  }
})()

export async function read_fingerprint(): Promise<GetResult> {
  const f = await FingerprintJS.load();
  result = await f.get();
  localStorage.setItem('fingerprint', JSON.stringify(result));
  return result;
}
export async function get_fingerprint(): Promise<GetResult> {
  return result || await read_fingerprint()
}
read_fingerprint().catch(e => console.error('fingerprint error', e));