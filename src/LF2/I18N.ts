
type WordMap = { [x in string]?: string | string[] }
type LangMap = { [x in string]?: string | WordMap }
export class I18N {
  static readonly TAG = 'I18N'
  protected _collections = new Map<string, WordMap>([['', {}]])
  protected _strings = new Map<string, { [x in string]?: string }>([['', {}]])
  protected _lists = new Map<string, { [x in string]?: string[] }>([['', {}]]);
  protected _lang: string = ''
  get lang() { return this._lang }
  set lang(v: string) { this.set_lang(v) }
  set_lang(lang: string) {
    if (typeof lang !== 'string')
      throw new Error(`[${I18N.TAG}::set_lang] lang should be string, bu got ${lang}`)
    this._lang = lang
    if (!this._strings.has(lang)) this._strings.set(lang, this._strings.get('')!)
    if (!this._lists.has(lang)) this._lists.set(lang, this._lists.get('')!)
  }
  add(langs: LangMap): void {
    if (!langs || typeof langs !== 'object' || Array.isArray(langs))
      return;
    for (const alias of Object.keys(langs)) {
      const temps = new Set([alias])
      let target = langs[alias]
      while (target) {
        if (Array.isArray(target))
          throw new Error(`[${I18N.TAG}::load] target not found, array is not allowed, path: ${Array.from(temps).join('=>')}`)
        if (target === null || target === void 0)
          throw new Error(`[${I18N.TAG}::load] target not found, path: ${Array.from(temps).join('=>')}`)
        if (typeof target === 'object') {
          this._collections.set(alias, target);
          break;
        }
        if (typeof target !== 'string')
          throw new Error(`[${I18N.TAG}::load] target not found, path: ${Array.from(temps).join('=>')}`)
        if (temps.has(target))
          throw new Error(`[${I18N.TAG}::load] loop-pointing is not allowed, path: ${Array.from(temps).join('=>')}=>${target}`)
        temps.add(target)
        target = langs[target]
      }
    }
    for (const [lang, any] of this._collections) {
      const strings: { [x in string]?: string } = this._strings.get(lang) ?? {}
      const lists: { [x in string]?: string[] } = this._lists.get(lang) ?? {}
      for (const k in any) {
        const v = any[k]
        if (typeof v === 'string') {
          strings[k] = v;
          lists[k] = [v];
        } else if (Array.isArray(v)) {
          strings[k] = v.join('\n');
          lists[k] = v.map(i => '' + i)
        }
      }
      this._strings.set(lang, strings)
      this._lists.set(lang, lists)
    }
    const strings = this._strings.get('')
    if (strings) {
      for (const k in strings) {
        for (const [lang, v] of this._strings) {
          if (lang === '') continue;
          v[k] = v[k] ?? strings[k]
        }
      }
    } else {
      this._strings.set('', {})
    }
    const string_lists = this._lists.get('')
    if (string_lists) {
      for (const k in string_lists) {
        for (const [lang, v] of this._lists) {
          if (lang === '') continue;
          v[k] = v[k] ?? string_lists[k]
        }
      }
    } else {
      this._lists.set('', {})
    }
  }
  string(name: string): string {
    const m = this._strings.get(this._lang);
    if (!m) return name;
    let ret = m[name]
    if (ret == void 0) ret = m[name] = name
    return ret
  }
  strings(name: string): string[] {
    const m = this._lists.get(this._lang);
    if (!m) return [name];
    let ret = m[name]
    if (ret == void 0) ret = m[name] = [name]
    return ret
  }
}
