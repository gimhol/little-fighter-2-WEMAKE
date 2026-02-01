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
  raw: any;
  cur: any;
  id: any;
  title: any;
  short_title: any;
  md_desc: any;
  desc: any;
  md_changelog: any;
  changelog: any;
  date?: string;
  versions_url?: string;
  url?: string;
  markdown: string = '';
  private _versions?: Info[];

  constructor(raw: any, lang: any) {
    this.raw = raw;
    this.cur = get_i18n(raw.i18n || {}, lang);
    this.md_desc = this.cur.desc || this.raw.desc;
    if (Array.isArray(this.md_desc)) this.md_desc = this.md_desc.join('\n');
    this.desc = this.md_desc
      ?.replace(/\!\[(.*?)\]\((.*?)\)/g, `<img src='$2' alt='$1'>`)
      .replace(/\[(.*?)\]\((.*?)\)/g, `<a href='$2' target='_blank'>$1</a>`);
    this.md_changelog = this.cur.changelog || this.raw.changelog;
    if (Array.isArray(this.md_changelog)) this.md_changelog = this.md_changelog.join('\n');

    this.changelog = this.md_changelog
      ?.replace(/\!\[(.*?)\]\((.*?)\)/g, `<img src='$2' alt='$1'>`)
      .replace(/\[(.*?)\]\((.*?)\)/g, `<a href='$2' target='_blank'>$1</a>`);
    const { versions } = this.cur;
    this.versions_url = isString(versions) ? versions : void 0;
    this.read_str('short_title');
    this.read_str('short_title');
    this.read_str('id');
    this.read_str('title');
    this.read_str('date');
    this.read_str('url');

    this.update_markdown()
  }
  get versions() { return this._versions; }
  set versions(v: Info[] | undefined) { this._versions = v; this.update_markdown(); }
  private read_str(name: keyof this) {
    const raw = this.cur[name] || this.raw[name];
    Object.assign(this, { [name]: raw });
  }
  with_lang(lang: any): Info {
    const ret = new Info(this.raw, lang);
    ret.versions = this.versions?.map(v => v.with_lang(lang));
    return ret;
  }
  get_download_url(type: string) {
    if (typeof this.cur.downloads !== 'object') return void 0;
    return this.cur.downloads[type] || '';
  }
  update_markdown() {
    this.read_str('markdown')
    if (!this.markdown) {
      let text = `# ${this.title}`
      text += '\n\n'
      text += `[中文](CHANGELOG.MD) | [English](CHANGELOG.EN.MD)`
      text += '\n\n'
      if (this.md_desc) text += `${this.md_desc}\n\n`
      if (this.versions?.length) {
        text += '## Changelog\n\n'
        for (const version of this.versions) {
          text += `### ${version.title}\n\n`
          if (version.date) text += `${version.date}\n\n`
          if (version.md_desc) text += `${version.md_desc}\n\n`
          if (version.md_changelog) text += `${version.md_changelog}\n\n`
        }
      }
      this.markdown = text;
    }
  }
}
