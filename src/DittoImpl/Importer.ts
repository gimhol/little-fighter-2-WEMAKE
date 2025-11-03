import axios, { AxiosResponse, RawAxiosRequestHeaders, ResponseType } from "axios";
import json5 from "json5";
import { PIO } from "../LF2/base/PromisesInOne";
import { IImporter } from "../LF2/ditto/importer/IImporter";
import { ImportError } from "../LF2/ditto/importer/ImportError";

const roots = ["builtin_data"];
function get_possible_url_list(list: string[]): string[] {
  const ret: string[] = [];
  for (let item of list) {
    if (
      item.startsWith("blob:") ||
      item.startsWith("http:") ||
      item.startsWith("https:")
    ) {
      ret.push(item);
      continue;
    }
    if (!item.startsWith("/")) item = "/" + item;
    ret.push(item);
    if (roots.some(v => item.startsWith('/' + v + '/')))
      continue;
    for (const root of roots)
      ret.push(root + item);
  }

  ret.forEach((item, index) => {
    if (item.startsWith("/")) {
      ret[index] = "." + item;
    }
  });
  return ret;
}

const ct_map = new Map([
  [".json", "application/json"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".jfif", "image/jpeg"],
  [".pjpeg", "image/jpeg"],
  [".pjp", "image/jpeg"],
  [".bmp", "image/bmp"],
  [".wav", "audio/wav"],
  [".wma", "audio/x-ms-wma"],
  [".mp3", "audio/mp3"],
  [".ogg", "application/ogg"],
]);
function get_req_header_accept(url: string): string | undefined {
  if (url.startsWith("blob")) return void 0;
  const ques_index = url.indexOf("?") + 1 || url.length + 1;
  const hash_index = url.indexOf("#") + 1 || url.length + 1;
  const end_index = Math.min(ques_index, hash_index) - 1;

  const path = url.substring(0, end_index).toLowerCase();

  for (const [k, v] of ct_map) {
    if (path.endsWith(k)) return v;
  }

  return void 0;
}
async function start_req<T>(url: string, responseType: ResponseType) {
  const headers: RawAxiosRequestHeaders = {};
  const accept = get_req_header_accept(url);
  if (accept) headers.Accept = accept;
  return await axios.get<T>(url, { responseType, headers });
};
async function import_as<T>(
  responseType: "json" | "blob" | 'arraybuffer',
  urls: string[],
): Promise<[AxiosResponse<T, any>, string]> {

  return new Promise((resolve, reject) => {
    let done = false
    const results: ({ data: [AxiosResponse, string], type: 1 } | { data: [string, any], type: 0 } | null)[] = []
    for (let i = 0; i < urls.length; ++i) {
      results[i] = null;
      const url = urls[i]
      const rt = responseType === 'json' ? 'text' : responseType;
      start_req<T>(url, rt).then(resp => {
        if (responseType === 'json') resp.data = json5.parse(resp.data as string)
        results[i] = { data: [resp, url], type: 1 };
      }).catch((e) => {
        results[i] = { data: [url, e], type: 0 }
      }).finally(() => {
        const errors: [string, any][] = []
        for (let i = 0; i < results.length; ++i) {
          const r = results[i]
          if (!r) return;
          if (r.type === 0) {
            errors.push(r.data)
            continue;
          }
          if (r.type === 1) {
            done = true;
            return resolve(r.data)
          }
        }
        if (errors.length === results.length) {
          done = true;
          reject(new ImportError(urls, errors))
        }
      })
    }
    setTimeout(() => {
      if (!done) debugger;
    }, 5000);
  })
}

export class __Importer implements IImporter {

  @PIO
  async import_as_json<T = any>(urls: string[]): Promise<[T, string]> {
    const url_list: string[] = get_possible_url_list(urls);
    return await import_as<T>("json", url_list).then(([v, url]) => [
      v.data,
      url,
    ]);
  }
  @PIO
  async import_as_blob(urls: string[]): Promise<[Blob, string]> {
    const url_list: string[] = get_possible_url_list(urls);
    const [resp, url] = await import_as<Blob>("blob", url_list);
    return [resp.data, url];
  }
  @PIO
  async import_as_blob_url(urls: string[]): Promise<[string, string]> {
    const [blob, url] = await this.import_as_blob(urls);
    return [URL.createObjectURL(blob), url];
  }

  @PIO
  async import_as_array_buffer(urls: string[]): Promise<[ArrayBuffer, string]> {
    const url_list: string[] = get_possible_url_list(urls);
    return import_as<ArrayBuffer>('arraybuffer', url_list).then(([v, url]) => [
      v.data,
      url,
    ]);
  }
}
