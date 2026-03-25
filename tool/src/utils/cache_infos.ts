import fs from "fs/promises";
import JSON5 from "json5";
import { file_md5_str } from "./file_md5_str";
import { md5 } from "./md5";
import { write_file } from "./write_file";
interface ICacheInfo {
  src: string,
  dst: string[],
  src_md5: string,
  dst_md5: string[],
}
function is_cache_info(v: any): v is ICacheInfo {
  if (!v) return false;
  const { src, dst, src_md5, dst_md5 } = v;
  if (typeof src !== 'string') return false;
  if (typeof src_md5 !== 'string') return false;
  if (!Array.isArray(dst)) return false;
  if (!Array.isArray(dst_md5)) return false;
  if (dst.length !== dst_md5.length) return false;
  if (dst.some(v => typeof v !== 'string')) return false;
  if (dst_md5.some(v => typeof v !== 'string')) return false;
  return true;
}
class CacheInfo {

  mgr: CacheInfos;
  src: string;
  dst: string[];

  get salt() { return this.mgr.salt }

  constructor(cache_infos: CacheInfos, raw: Pick<ICacheInfo, 'dst' | 'src'>) {
    this.mgr = cache_infos;
    this.src = raw.src
    this.dst = [...raw.dst]
  }

  toJSON(): ICacheInfo {
    return {
      src: this.src,
      dst: this.dst,
      src_md5: "",
      dst_md5: []
    }
  }
  async changed(): Promise<boolean> {
    const prev = this.mgr.get_raw_info(this.src, this.dst);
    const src_md5 = await this.src_md5();
    if (prev.src !== this.src) return true;
    if (prev.src_md5 != src_md5) return true;
    const dst_md5 = await this.dst_md5();
    if (prev.dst.length !== this.dst.length) return true;
    for (let i = 0; i < dst_md5.length; i++) {
      if (prev.dst_md5[i] !== dst_md5[i]) return true;
    }
    return false;
  }
  async src_md5(): Promise<string> {
    return await file_md5_str(this.src, this.salt).catch(() => "");
  }
  async dst_md5(): Promise<string[]> {
    const ret: string[] = []
    for (const dst of this.dst) {
      const md5 = await file_md5_str(dst, this.salt).catch(() => "");
      ret.push(md5)
    }
    return ret;
  }
  async update() {
    const { src, dst } = this;
    const src_md5 = await file_md5_str(this.src, this.salt).catch(() => "");
    const dst_md5 = await this.dst_md5()
    this.mgr.set_raw_info({
      src, dst, src_md5, dst_md5,
    });
  }
  static async create(
    mgr: CacheInfos,
    raw: Pick<ICacheInfo, "dst" | "src">,
  ) {
    return new CacheInfo(mgr, raw);
  }
}
export class CacheInfos {
  protected cache_info_map = new Map<string, CacheInfo>();
  protected _unuseds = new Map<string, ICacheInfo>();
  protected raw: { [x in string]?: ICacheInfo } = {};
  protected cache_infos_path: string;
  get unuseds(): Map<string, ICacheInfo> {
    return this._unuseds
  }
  readonly salt = ""
  static async create(path: string) {
    const raw_obj: any = await fs
      .readFile(path)
      .then((r) => {
        return r.toString();
      })
      .then((r) => {
        return JSON5.parse(r);
      })
      .catch((e) => {
        return {};
      });
    return new CacheInfos(path, raw_obj);
  }
  protected constructor(cache_infos_path: string, raw: any) {
    this.cache_infos_path = cache_infos_path;
    this.raw = raw;
    for (const key in raw) this._unuseds.set(key, raw[key])
  }
  key(src: string, dst: string[]): string {
    return md5(src + '#' + dst.join('#'));
  }
  async get_info(src: string, dst: string[]): Promise<CacheInfo> {
    const key = this.key(src, dst);
    let ret = this.cache_info_map.get(key);
    if (!ret) {
      this.cache_info_map.set(
        key,
        (ret = await CacheInfo.create(this, { src, dst })),
      );
    }
    this._unuseds.delete(key)
    return ret;
  }
  get_raw_info(src: string, dst: string[]): ICacheInfo {
    const key = this.key(src, dst);
    const value = this.raw[key];
    if (is_cache_info(value)) return value
    return {
      src,
      dst,
      src_md5: "",
      dst_md5: dst.map(v => "")
    }
  }
  set_raw_info(info: ICacheInfo): ICacheInfo {
    const key = this.key(info.src, info.dst);
    return this.raw[key] = info;
  }
  async save() {
    // for (const [key] of this.unuseds) 
    //   delete this.raw[key]
    await write_file(
      this.cache_infos_path,
      JSON5.stringify(this.raw, { space: 2, quote: '"' }),
    );
  }
}
