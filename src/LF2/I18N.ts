
type WordKey = string;
type WordMap = { [x in WordKey]?: string | string[] }
type LangKey = string;
type LangMap = { [x in LangKey]?: string | WordMap }

export class I18N {
  static readonly TAG = 'I18N'
  protected _words = new Map<LangKey, { [x in WordKey]?: string }>([['', {}]])
  protected _lists = new Map<LangKey, { [x in WordKey]?: string[] }>([['', {}]]);
  protected _alias_map = new Map<LangKey, LangKey>();
  protected _lang: string = ''

  get base_words() { return this._words.get('')! }
  get base_lists() { return this._lists.get('')! }

  get lang() { return this._lang }
  set lang(v: string) { this.set_lang(v) }
  set_lang(lang: string) {
    if (typeof lang !== 'string')
      throw new Error(`[${I18N.TAG}::set_lang] lang should be string, but got ${lang}`)
    this._lang = lang
  }

  add(langs: LangMap): void {
    if (!langs) return;
    if (typeof langs !== 'object') return;
    if (Array.isArray(langs)) return;
    for (const lang_name in langs) {
      let new_words = langs[lang_name]
      if (typeof new_words === 'string') {
        this._alias_map.set(lang_name, new_words);
        continue;
      }
      if (!new_words) continue;
      if (typeof new_words != 'object') continue;
      if (Array.isArray(new_words)) continue;

      let strings = this._words.get(lang_name)
      if (!strings) this._words.set(lang_name, strings = {})

      let lists = this._lists.get(lang_name)
      if (!lists) this._lists.set(lang_name, lists = {})

      for (const k in new_words) {
        const new_word = new_words[k]
        if (typeof new_word === 'string') {
          strings[k] = new_word;
          lists[k] = [new_word];
        } else if (Array.isArray(new_word)) {
          strings[k] = new_word.join('\n');
          lists[k] = new_word.map(i => '' + i)
        }
      }
    }
  }

  alias(): string | undefined {
    let ret: string = this._lang;
    const visited: string[] = [];
    while (ret !== void 0) {
      if (visited.includes(ret)) return void 0;
      visited.push(ret);
      const next = this._alias_map.get(ret);
      if (!next) return ret;
      ret = next;
    }
    if (this._lang == ret) return void 0;
    return ret;
  }

  string(name: string): string {
    const m = this._words.get(this._lang);
    if (m) {
      let ret = m[name]
      if (ret == void 0) ret = m[name] = (this.base_words[name] ?? name)
      return ret
    }

    const alias = this.alias() ?? '';
    const words = this._words.get(alias);
    if (words) {
      this._words.set(this._lang, words);
      return this.string(name);
    }
    this._words.set(this._lang, { [name]: (this.base_words[name] ?? name) });
    return name;
  }

  strings(name: string): string[] {
    const m = this._lists.get(this._lang);
    if (m) {
      let ret = m[name]
      if (ret == void 0) ret = m[name] = (this.base_lists[name] ?? [name])
      return ret
    }

    const alias = this.alias() ?? '';
    const lists = this._lists.get(alias);
    if (lists) {
      this._lists.set(this._lang, lists);
      return this.strings(name);
    }
    const ret = (this.base_lists[name] ?? [name])
    this._lists.set(this._lang, { [name]: ret });
    return [name];
  }
}
