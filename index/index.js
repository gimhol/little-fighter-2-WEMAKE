const strings_map = new Map()
const time_str = Math.floor(Date.now() / 60000);

const lang = (() => {
  const hashs = new URLSearchParams('?' + window.location.hash.substring(1));
  const a = hashs.get('lang')
  const searchs = new URLSearchParams(window.location.search);
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
  const all = await fetch('./strings.json?time=' + time_str).then(r => r.json())
  ret = get_i18n(all)
  strings_map.set(lang, ret = get_i18n(all))
  return ret
}

async function main() {
  const strings = await get_strings();
  const versions = await fetch('./versions.json?time=' + time_str).then(r => r.json())
  // if (l.length == 1) location.href = l[0].url;
  // let versions = await fetch('./versions.json?time=' + time_str).then(r => r.json())
  // versions = [...versions, ...versions, ...versions, ...versions, ...versions, ...versions]

  if (!Array.isArray(versions)) return;

  const { content } = document.getElementById('btn_goto_version')
  for (const version of versions) {
    const { i18n, id } = version;
    const {
      title = version.title,
      desc = version.desc,
      url = version.url,
    } = get_i18n(i18n)

    /** @type {HTMLElement} */
    const clone = document.importNode(content, true);
    clone.id = id;

    /** @type {HTMLElement} */
    el_url = clone.querySelector('.el_url')
    el_url.href = url
    el_url.innerText = title

    /** @type {HTMLElement} */
    el_desc = clone.querySelector('.el_desc')
    el_desc.innerHTML = Array.isArray(desc) ? desc.join('\n') : desc

    const btn_goto_version = clone.querySelector('.btn_goto_version')
    btn_goto_version.onclick = function () { location.href = url }
    document.getElementById('version_list').append(clone)
  }

  const eles = document.querySelectorAll('.i18n_txt')
  for (const ele of eles) {
    const text = ele.getAttribute('data-text')
    ele.textContent = strings[text] ?? text;
  }
}
main()