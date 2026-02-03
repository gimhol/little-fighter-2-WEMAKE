/* eslint-disable @typescript-eslint/no-explicit-any */
import { isString } from "lodash";
export function get_i18n(all: any, lang: string) {
  if (!all) return null;
  const base = all[''];
  let more = all[lang];
  while (typeof more === 'string')
    more = all[more];
  return { ...base, ...more }
}

export class Info {
  static readonly OPEN_IN_BROWSER = 'open_in_browser';
  static readonly PLAY_IN_BROWSER = 'play_in_browser';
  static readonly DOWNLOAD = 'download';

  raw: any;
  cur: any;
  id: any;
  title: any;
  short_title: any;
  desc?: string;
  desc_url?: string;
  changelog?: string;
  changelog_url?: string;
  date?: string;
  versions_url?: string;
  url?: string;
  url_type?: string;
  cover?: string;
  author?: string;
  author_url?: string;
  type?: string;
  unavailable?: string;
  private _versions?: Info[];

  constructor(raw: any, lang: any) {
    this.raw = raw;
    this.cur = get_i18n(raw.i18n || {}, lang);
    this.desc = this.cur.desc || this.raw.desc;
    if (Array.isArray(this.desc)) this.desc = this.desc.join('\n');
    this.changelog = this.cur.changelog || this.raw.changelog;
    if (Array.isArray(this.changelog)) this.changelog = this.changelog.join('\n');
    const { versions } = this.cur;
    this.versions_url = isString(versions) ? versions : void 0;
    this.read_str('desc_url');
    this.read_str('changelog_url');
    this.read_str('short_title');
    this.read_str('id');
    this.read_str('title');
    this.read_str('date');
    this.read_str('url');
    this.read_str('url_type');
    this.read_str('type');
    this.read_str('author');
    this.read_str('author_url');
    this.read_str('cover');
    this.read_str('unavailable');
  }
  get versions() { return this._versions; }
  set versions(v: Info[] | undefined) { this._versions = v; }
  private read_str(name: keyof this) {
    const raw = this.cur[name] || this.raw[name];
    Object.assign(this, { [name]: raw });
  }
  private get_str(name: keyof this): string | undefined {
    const raw = this.cur[name] || this.raw[name];
    if (raw === void 0 || raw === null) return void 0
    return '' + raw;
  }
  with_lang(lang: string): Info {
    const ret = new Info(this.raw, lang);
    ret.versions = this.versions?.map(v => v.with_lang(lang));
    return ret;
  }
  get_download_url(type: string) {
    if (typeof this.cur.downloads !== 'object') return void 0;
    return this.cur.downloads[type] || '';
  }
  async markdown() {
    const md = this.get_str('markdown')
    if (md) return md;

    let text = `# ${this.title}`
    text += '\n\n'
    text += `[中文](CHANGELOG.MD) | [English](CHANGELOG.EN.MD)`
    text += '\n\n'
    text += await this.fetch_desc().then(r => r ? `${r}\n\n` : '')
    text += await this.fetch_changelog().then(r => r ? `${r}\n\n` : '')

    if (this.versions?.length) {
      text += '## Changelog\n\n'
      for (const version of this.versions) {
        text += `### ${version.title}\n\n`
        if (version.date) text += `${version.date}\n\n`
        text += await version.fetch_desc().then(r => r ? `${r}\n\n` : '')
        text += await version.fetch_changelog().then(r => r ? `${r}\n\n` : '')
      }
    }
    return text;
  }

  async fetch_desc() {
    if (this.desc) return this.desc
    if (!this.desc_url) return '';
    return await fetch(this.desc_url, { mode: 'cors' })
      .then(r => r.text())
      .then(v => this.desc = v)
      .catch(e => '' + e)
  }
  async fetch_changelog() {
    if (this.changelog) return this.changelog
    if (!this.changelog_url) return '';
    return await fetch(this.changelog_url, { mode: 'cors' })
      .then(r => r.text())
      .then(v => this.changelog = v)
      .catch(e => '' + e)
  }
  set_desc(v: string) { this.desc = v; }
  set_changelog(v: string) { this.changelog = v; }
}
