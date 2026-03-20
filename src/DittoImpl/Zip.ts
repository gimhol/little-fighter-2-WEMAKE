import axios from "axios";
import json5 from "json5";
import JSZIP from "jszip";
import { IZip, IZipObject } from "../LF2/ditto";
import { is_str } from "../LF2/utils/type_check";

export class ZipObject implements IZipObject {
  protected inner: JSZIP.JSZipObject;
  get name() {
    return this.inner.name;
  }

  constructor(inner: JSZIP.JSZipObject) {
    this.inner = inner;
  }
  async text(): Promise<string> {
    return this.inner.async("text");
  }
  async json(): Promise<any> {
    return this.text().then(json5.parse);
  }
  async blob(): Promise<Blob> {
    return this.inner.async("blob");
  }
  async blob_url(): Promise<string> {
    return URL.createObjectURL(await this.blob());
  }
  async array_buffer(): Promise<ArrayBuffer> {
    return this.inner.async('arraybuffer')
  }
  async uint8_array(): Promise<Uint8Array> {
    return this.inner.async('uint8array')
  }
}

export class __Zip implements IZip {
  static async read_file(file: File): Promise<IZip> {
    const buf = await file.arrayBuffer().then((raw) => new Uint8Array(raw));
    const jszip = await JSZIP.loadAsync(buf);
    return new __Zip(file.name, jszip, buf);
  }
  static async read_buf(name: string, buf: Uint8Array): Promise<IZip> {
    const jszip = await JSZIP.loadAsync(buf);
    return new __Zip(name, jszip, buf);
  }
  static async read_blob(name: string, blob: Blob): Promise<IZip> {
    const buf = await blob.arrayBuffer().then((raw) => new Uint8Array(raw));
    const jszip = await JSZIP.loadAsync(blob);
    return new __Zip(name, jszip, buf);
  }
  static async download(
    url: string,
    on_progress: (progress: number, size: number) => void,
  ): Promise<IZip> {
    const buf = await axios
      .get<ArrayBuffer>(url, {
        responseType: "arraybuffer",
        params: { time: Date.now() },
        onDownloadProgress: (e_1) => {
          const progress_1 = e_1.total
            ? Math.round((100 * e_1.loaded) / e_1.total)
            : 100;
          on_progress(progress_1, e_1.total ?? e_1.loaded);
        },
      })
      .then((resp) => new Uint8Array(resp.data));
    const jszip = await JSZIP.loadAsync(buf);
    return new __Zip(url, jszip, buf);
  }

  readonly buf: Uint8Array;
  readonly name: string;
  private inner: JSZIP;
  private constructor(name: string, inner: JSZIP, buf: Uint8Array) {
    this.inner = inner;
    this.buf = buf;
    this.name = name;
  }

  file(path: string): ZipObject | null;
  file(path: RegExp): ZipObject[];
  file(path: string | RegExp): ZipObject | null | ZipObject[] {
    if (is_str(path)) {
      const obj = this.inner.file(path);
      return obj ? new ZipObject(obj) : null;
    } else {
      return this.inner.file(path).map((v) => new ZipObject(v));
    }
  }
  set(path: string, data: string): void {
    this.inner.file(path, data);
  }
  blob(): Promise<Blob> {
    return this.inner.generateAsync({ type: 'blob' });
  }
  get files(): { [key in string]?: ZipObject } {
    const ret: { [key in string]?: ZipObject } = {};
    for (const key in this.inner.files) {
      ret[key] = new ZipObject(this.inner.files[key])
    }
    return ret;
  }
}