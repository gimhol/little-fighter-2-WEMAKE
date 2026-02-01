import i18n from "i18next";
import qs from "qs";
import { initReactI18next } from "react-i18next";
const zh = {
  "author": "作者",
  "date": "日期",
  "main_title": "选你所选",
  "version_unavailable": "此版本已停用",
  "dl_win_x64": "下载 Windows x64 应用",
  "pl_in_browser": "在浏览器中进行游戏",
  "goto_github": "打开Github项目地址",
  "goto_gimink": "打开作者博客",
  "switch_lang": "切换语言 / Switch Language",
  "no_content": "无内容",
  "visit_author_link": "访问作者链接"
}
const en = {
  "author": "author",
  "date": "date",
  "main_title": "Select Game Version",
  "version_unavailable": "Version Unavailable",
  "dl_win_x64": "Download Window x64 Application",
  "pl_in_browser": "Play in Browser",
  "goto_github": "Visit this Project on Github",
  "goto_gimink": "Visit Author Blog",
  "switch_lang": "切换语言 / Switch Language",
  "no_content": "No Content",
  "visit_author_link": "Visit Author Link"
}
const resources = {
  "zh": { translation: zh },
  "zh-Hans": { translation: zh },
  "zh-CN": { translation: zh },
  "zh-SG": { translation: zh },
  "zh-MY": { translation: zh },
  "zh-Hant": { translation: zh },
  "zh-TW": { translation: zh },
  "zh-HK": { translation: zh },
  "zh-MO": { translation: zh },
  en: { translation: en }
};
const hobj = qs.parse(location.hash.substring(1))
const sobj = qs.parse(location.search.substring(1))
const hsobj = location.hash.indexOf('?') >= 1 ? qs.parse(location.hash.substring(location.hash.indexOf('?') + 1)) : {}
const lang = sobj.lang || hobj.lang || hsobj.lang;
i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: typeof lang === 'string' ? lang : navigator.language,
    interpolation: { escapeValue: false }
  });

export default i18n;