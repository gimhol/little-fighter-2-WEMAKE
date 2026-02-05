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
  children_url?: string;
  url?: string;
  url_type?: string;
  cover?: string;
  author?: string;
  author_url?: string;
  type?: string;
  unavailable?: string;
  private _children?: Info[];

  constructor(raw: any, lang: any) {
    this.raw = raw;
    this.cur = get_i18n(raw.i18n || {}, lang);
    this.desc = this.cur.desc || this.raw.desc;
    if (Array.isArray(this.desc)) this.desc = this.desc.join('\n');
    this.changelog = this.cur.changelog || this.raw.changelog;
    if (Array.isArray(this.changelog)) this.changelog = this.changelog.join('\n');
    const { children } = this.cur;
    if (isString(children)) {
      this.children_url = children
    } else if (Array.isArray(children)) {
      this._children = children
    }
    this.read_str(
      'desc_url', 'changelog_url', 'short_title', 'id', 'title', 'date', 'url',
      'url_type', 'type', 'author', 'author_url', 'cover', 'unavailable'
    );
  }
  get children() { return this._children; }
  set children(v: Info[] | undefined) { this._children = v; }
  private read_str(...names: (keyof this)[]): void {
    for (const name of names) {
      const raw = this.cur[name] || this.raw[name];
      Object.assign(this, { [name]: raw });
    }
  }
  private get_str(name: keyof this): string | undefined {
    const raw = this.cur[name] || this.raw[name];
    if (raw === void 0 || raw === null) return void 0
    return '' + raw;
  }
  with_lang(lang: string): Info {
    const ret = new Info(this.raw, lang);
    ret.children = this.children?.map(v => v.with_lang(lang));
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

    if (this.children?.length) {
      text += '## Changelog\n\n'
      for (const version of this.children) {
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
