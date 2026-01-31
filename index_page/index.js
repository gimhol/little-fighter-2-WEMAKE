const strings_map = new Map()
const time_str = Math.floor(Date.now() / 60000);

const lang = (() => {
  const hashs = new URLSearchParams('?' + location.hash.substring(1));
  const a = hashs.get('lang')
  const searchs = new URLSearchParams(location.search);
  const b = searchs.get('lang')
  const c = navigator.language.toLowerCase();
  console.log({ a, b, c })
  return a || b || c
})()

function get_i18n(all) {
  if (!all) return null;
  const base = all[''];
  let more = all[lang];
  while (typeof more === 'string')
    more = all[more];
  return { ...base, ...more }
}

async function get_strings() {
  let ret = strings_map.get(lang)
  if (ret) return ret;
  const all = await fetch(`./strings.json?time=${time_str}`).then(r => r.json())
  ret = get_i18n(all)
  strings_map.set(lang, ret = get_i18n(all))
  return ret
}
/**
 * 
 * @returns {Promise<IGameInfo[]>}
 */
async function get_games() {
  return await fetch(`./games.json?time=${time_str}`).then(r => r.json())
}

async function main() {
  const strings = await get_strings();
  const eles = document.querySelectorAll('.i18n_txt')
  for (const ele of eles) {
    const text = ele.getAttribute('data-text')
    ele.textContent = strings[text] ?? text;
  }
  await fetch_games_list();
}


const state = {
  /** @type {Info|undefined} */
  actived: void 0,

  /** @type {Info[]} */
  versions: [],

  /** @type {Info[]} */
  games: []
}

class Info {
  constructor(raw) {
    this.raw = raw;
    this.info = get_i18n(raw.i18n || {})
    this.id = this.info.id || this.raw.id
    this.title = this.info.title || this.raw.title
    this.short_title = this.info.short_title || this.raw.short_title
    this.url = this.info.url || this.raw.url

    this.date = this.info.date || this.raw.date

    this.md_desc = this.info.desc || this.raw.desc
    if (Array.isArray(this.md_desc)) this.md_desc = this.md_desc.join('\n')

    this.desc = this.md_desc?.replace(/\[(.*?)\]\((.*?)\)/g, `<a href='$2'>$1</a>`)
    this.md_changelog = this.info.changelog || this.raw.changelog
    if (Array.isArray(this.md_changelog)) this.md_changelog = this.md_changelog.join('\n')
    this.changelog = this.md_changelog?.replace(/\[(.*?)\]\((.*?)\)/g, `<a href='$2'>$1</a>`)
  }
  get_download_url(type) {
    if (typeof type !== 'string') return void 0;
    if (typeof this.info.downloads !== 'object') return void 0;
    return this.info.downloads[type] || ''
  }
}

async function fetch_games_list(url = `games.json?time=${time_str}`) {
  state.games.length = 0
  state.games.push(...await get_games().then(v => v.map(b => new Info(b))))

  const el_game_list = document.getElementById('game_list');
  el_game_list.innerHTML = ''

  const el_item_template = document.getElementById('game_item_template').content

  for (const game of state.games) {
    /** @type {HTMLElement} */
    const el_item = document.importNode(el_item_template, true);
    el_item.children.item(0).setAttribute('id', game.id);

    /** @type {HTMLElement} */
    const game_short_title = el_item.querySelector('.game_short_title')
    game_short_title.append(game.short_title)
    game_short_title.onclick = () => set_actived_game(game);
    el_game_list.append(el_item)
  }
  set_actived_game(state.games[0]);
}


/**
 *
 *
 * @param {Info} game
 * @return {Promise<void>} 
 */
async function set_actived_game(game) {
  console.log('set_actived_game(game), game = ', game)
  if (state.actived === game) return;
  clear_version_list();
  state.actived = game;

  const el_game_title = document.getElementById('game_title')
  if (game.title) el_game_title.style.display = ''
  else el_game_title.style.display = 'none'
  el_game_title.firstElementChild.innerHTML = '' + game.title

  const el_game_desc = document.getElementById('game_desc')
  if (game.desc) el_game_desc.style.display = ''
  else el_game_desc.style.display = 'none'
  el_game_desc.innerHTML = '' + game.desc

  document.querySelector('.game_item_actived')?.classList.remove('game_item_actived')
  document.querySelector(`#${game.id}`)?.classList.add('game_item_actived')
  state.versions = await fetch_version_list(`${game.url}?time=${time_str}`)
  document.querySelector(`#game_title_link`).href = state.versions?.[0].url
}
function clear_version_list() {
  const el_version_list = document.getElementById('version_list');
  el_version_list.innerHTML = '';
}
async function fetch_version_list(url) {
  clear_version_list();
  /** @type {Info[]} */
  const versions = await fetch(url).then(a => a.json()).then(b => b.map(c => new Info(c)))
  const el_version_list = document.getElementById('version_list');
  const { content } = document.getElementById('version_item_template')
  for (const version of versions) {
    const { title, desc, url, date, changelog, id } = version
    /** @type {HTMLElement} */
    const el_item = document.importNode(content, true);
    el_item.id = id;

    /** @type {HTMLElement} */
    const el_url = el_item.querySelector('.el_url')
    el_url.href = url
    el_url.innerText = title

    /** @type {HTMLElement} */
    const el_desc = el_item.querySelector('.el_desc')
    el_desc.innerHTML = Array.isArray(desc) ? desc.join('\n') : desc ? desc : ''

    const el_date = el_item.querySelector('.el_date')
    el_date.innerHTML = date

    const btn_play_in_browser = el_item.getElementById('btn_play_in_browser')

    if (url) btn_play_in_browser.href = url
    else btn_play_in_browser.remove()
    
    const btn_download_win_x64 = el_item.getElementById('btn_download_win_x64')

    const win_x64_url = version.get_download_url('win_x64')
    if (win_x64_url) btn_download_win_x64.href = win_x64_url
    else btn_download_win_x64.remove()

    const el_changelog = el_item.querySelector('.el_changelog')
    if (!el_desc.innerHTML) el_changelog.innerHTML = ''
    if (el_changelog && changelog?.length) {
      el_changelog.append(Array.isArray(changelog) ? changelog.join('\n') : changelog)
    } else if (el_changelog) {
      el_changelog.remove()
    }
    el_version_list.append(el_item)
  }

  return versions
}
main()


const langs = ['zh', 'en']
function update_lang_btn() {
  const { search } = location
  const s_obj = new URLSearchParams(search);
  const lang = s_obj.get('lang') || navigator.language.toLowerCase();
  const idx = langs.findIndex(v => lang.startsWith(v))
  const el_lang_f = document.getElementById('lang_f')
  const el_lang_b = document.getElementById('lang_b')
  if (idx === 0) {
    el_lang_f.innerText = '中'
    el_lang_b.innerText = 'En'
  } else {
    el_lang_f.innerText = 'En'
    el_lang_b.innerText = '中'
  }
}
function switch_lang() {
  const url = location.protocol + '//' + location.host + location.pathname;
  const { search, hash } = location
  const s_obj = new URLSearchParams(search);
  let lang = s_obj.get('lang') || navigator.language.toLowerCase();
  const idx = langs.findIndex(v => lang.startsWith(v))
  lang = langs[(idx + 1) % langs.length]
  s_obj.set('lang', lang)
  const new_searh = s_obj.toString()
  location.href = url + ('?' + new_searh) + hash;
  update_lang_btn();
}
update_lang_btn();

