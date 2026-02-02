/* eslint-disable react-hooks/refs */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "@/components/link";
import { Viewer } from "@/components/markdown/Viewer";
import classnames from "classnames";
import QueryString from "qs";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import img_gim_ink from "../../assets/img_gim_ink.png";
import img_github_mark_white from "../../assets/img_github_mark_white.svg";
import img_markdown_white from "../../assets/img_markdown_white.svg";
import { Info } from "../../base/Info";
import { InfoCard } from "../../components/cards/InfoCard";
import { Loading } from "../../components/loading/LoadingImg";
import { Paths } from "../../Paths";
import { useMovingBg } from "../../useMovingBg";
import { InfoListItem } from "./InfoListItem";
import styles from "./styles.module.scss";

const time_str = Math.floor(Date.now() / 60000);
export default function MainPage() {
  const { t, i18n } = useTranslation()
  const [games, set_games] = useState<Info[]>()
  const [versions, set_versions] = useState<Info[]>()
  const [actived_game, set_actived_game] = useState<Info>()
  const [games_loading, set_games_loading] = useState(false);
  const [versions_loading, set_versions_loading] = useState(false);
  const [game_desc_open, set_game_desc_open] = useState(true)
  const [md_open, set_md_open] = useState(false);
  const [is_cards_view, set_is_cards_view] = useState(false)
  const loading = versions_loading || games_loading

  const ref_lang = useRef<'zh' | 'en'>('zh')
  ref_lang.current = i18n.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  const is_en = ref_lang.current === 'en';
  useMovingBg(document.documentElement)
  const nav = useNavigate()
  useEffect(() => {
    if (!actived_game) return;
    nav({
      pathname: Paths.All.main_page,
      search: `?game=${actived_game.id}`,
    }, {
      replace: true
    })
  }, [actived_game, nav])
  const loc = useLocation()
  useEffect(() => {
    const ab = new AbortController();
    set_games_loading(true)
    fetch(`games.json?time=${time_str}`, { signal: ab.signal })
      .then(resp => { return resp.json() })
      .then((raw_list: any[]) => {
        if (ab.signal.aborted) return;
        const list = raw_list.map((raw_item: any) => new Info(raw_item, ref_lang.current))
        const { game } = QueryString.parse(loc.search.substring(1))
        const a = list.find(v => v.id === game) ?? list[0]
        set_actived_game(a)
        set_is_cards_view(a?.type == 'cards')
        set_games(list)
      }).catch(e => {
        if (ab.signal.aborted) return;
        console.warn(e)
      }).finally(() => {
        if (ab.signal.aborted) return;
        set_games_loading(false)
      })
    return () => ab.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!actived_game) { return; }
    const { versions, versions_url } = actived_game;
    if (versions?.length) { set_versions(versions); return; }
    if (!versions_url) return;
    const ab = new AbortController()
    set_versions_loading(true)
    fetch(versions_url)
      .then(r => r.json())
      .then(raw_list => {
        if (ab.signal.aborted) return;
        const list = raw_list.map((raw_item: any) => new Info(raw_item, ref_lang.current))
        actived_game.versions = list
        set_versions(list)
      }).catch(e => {
        if (ab.signal.aborted) return;
        console.warn(e)
      }).finally(() => {
        if (ab.signal.aborted) return;
        set_versions_loading(false)
      })
    return () => ab.abort()
  }, [actived_game])

  return <>
    <div className={styles.main_page}>
      <div className={styles.head}>
        <h1 className={styles.main_title}>
          {t("main_title")}
        </h1>
        <button
          className={styles.head_right_btn}
          onClick={() => {
            const next = is_en ? 'zh' : 'en'
            i18n.changeLanguage(next)
            const next_games = games?.map(v => v.with_lang(next))
            const next_actived_game = next_games?.find(v => v.id === actived_game?.id)
            const next_versions = next_actived_game?.versions
            set_actived_game(next_actived_game)
            set_is_cards_view(next_actived_game?.type == 'cards')
            set_games(next_games)
            set_versions(next_versions)
          }}
          title={t('switch_lang')}>
          <div className={styles.lang_btn_inner}>
            <span className={classnames(styles.lang_btn_inner_span, styles.lang_btn_inner_span_f)}>
              {is_en ? '中' : 'En'}
            </span>
            <span className={classnames(styles.lang_btn_inner_span, styles.lang_btn_inner_span_b)}>
              {is_en ? 'En' : '中'}
            </span>
          </div>
        </button>
        <Link
          className={styles.head_right_btn}
          href="https://github.com/gimhol/little-fighter-2-WEMAKE"
          title={t('goto_github')}>
          <img src={img_github_mark_white} width="20px" alt={t('goto_github')} />
        </Link>
        <Link
          className={styles.head_right_btn}
          href="https://gim.ink"
          title={t('goto_gimink')}>
          <img src={img_gim_ink} width="26px" alt={t('goto_gimink')} />
        </Link>
      </div>
      <div className={styles.main}>
        {
          !games?.length || games.length <= 1 ? null :
            <div className={classnames(styles.game_list, styles.scrollview)}>
              {games?.map((v) => {
                const cls_name = (actived_game?.id === v.id) ? styles.game_item_actived : styles.game_item
                return (
                  <button className={cls_name} key={v.id} onClick={() => {
                    set_actived_game(v)
                    set_is_cards_view(v.type == 'cards')
                  }}>
                    {v.short_title}
                  </button>
                )
              })}
            </div>
        }
        <div className={styles.main_right}>
          {
            !actived_game ? null :
              <div className={styles.game_desc_zone}>
                <h3 className={styles.game_title}>
                  <Link href={versions?.find(v => v.url)?.url}>
                    {actived_game?.title}
                  </Link>
                  <div style={{ flex: 1 }}></div>
                  {
                    loading ? null :
                      <button className={styles.btn} onClick={() => set_md_open(true)} title="copy as Markdown">
                        <img src={img_markdown_white} alt="copy as Markdown" width={20} />
                      </button>
                  }
                  <button className={styles.btn} onClick={() => set_is_cards_view(!is_cards_view)} title="Cards or List">
                    <span className={styles.btn_span}>{is_cards_view ? 'L' : 'C'}</span>
                  </button>
                  <button className={styles.btn} onClick={() => set_game_desc_open(!game_desc_open)} title="▼ or ▲">
                    <span className={styles.btn_span} style={{ transform: `rotateZ(${game_desc_open ? 0 : 180}deg)` }}>▲</span>
                  </button>
                </h3>
                {!game_desc_open ? null : <Viewer content={actived_game?.desc} />}
              </div>
          }
          {
            (!is_cards_view || !versions?.length) ? null :
              <div className={classnames(styles.card_list, styles.scrollview)}>
                {versions?.map(version => <InfoCard info={version} key={version.id} />)}
              </div>
          }
          {
            (is_cards_view || !versions?.length) ? null :
              <div className={classnames(styles.version_list, styles.scrollview)}>
                {
                  versions.map(version => {
                    return <InfoListItem info={version} key={version.id} />
                  })
                }
              </div>
          }
        </div>
      </div>
      <div className={styles.foot}>
        {/* <a className={styles.link}
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noreferrer">
          粤ICP备2021170807号-1
        </a> */}
      </div>
    </div>
    <Loading big loading={loading} style={{ position: 'absolute', margin: 'auto auto' }} />
    {
      !md_open || !actived_game ? null :
        <div
          className={classnames(styles.changelog_md_mask)}
          onKeyDown={e => { if (e.key.toLowerCase() === 'escape') set_md_open(false) }}>
          <div className={classnames(styles.changelog_md_modal)}>
            <button
              className={classnames(styles.btn_copy)}
              onClick={() => navigator.clipboard.writeText(actived_game.markdown)}>
              📋
            </button>
            <button
              className={classnames(styles.btn_close)}
              onClick={() => set_md_open(false)}>
              ✖︎
            </button>
            <div
              ref={r => r?.focus()}
              className={classnames(styles.changelog_md_content, styles.scrollview)}
              dangerouslySetInnerHTML={{ __html: actived_game.markdown }}
              contentEditable
              tabIndex={-1} />
          </div>
        </div>
    }
  </>
}

