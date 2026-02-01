/* eslint-disable react-hooks/refs */
/* eslint-disable @typescript-eslint/no-explicit-any */
import classnames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import img_browser_mark_white from "../../assets/img_browser_mark_white.svg";
import img_gim_ink from "../../assets/img_gim_ink.png";
import img_github_mark_white from "../../assets/img_github_mark_white.svg";
import img_markdown_white from "../../assets/img_markdown_white.svg";
import img_windows_x64_white from "../../assets/img_windows_x64_white.svg";
import { Loading } from "../../LoadingImg";
import { useMovingBg } from "../../useMovingBg";
import { Card } from "./Card";
import { Info } from "./Info";
import styles from "./styles.module.scss";

const time_str = Math.floor(Date.now() / 60000);
export default function MainPage() {
  const { t, i18n } = useTranslation()
  const pl_in_browser = t('pl_in_browser')
  const dl_win_x64 = t('dl_win_x64')
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

  useEffect(() => {
    const ab = new AbortController();
    set_games_loading(true)
    fetch(`games.json?time=${time_str}`, { signal: ab.signal })
      .then(resp => new Promise<any>((r) => setTimeout(() => r(resp.json()), 1000)))
      .then(raw_list => {
        if (ab.signal.aborted) return;
        const list = raw_list.map((raw_item: any) => new Info(raw_item, ref_lang.current))
        set_actived_game(list[0])
        set_is_cards_view(list[0]?.type == 'cards')
        set_games(list)
      }).catch(e => {
        if (ab.signal.aborted) return;
        console.warn(e)
      }).finally(() => {
        if (ab.signal.aborted) return;
        set_games_loading(false)
      })
    return () => ab.abort()
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
        <a
          className={styles.head_right_btn}
          href="https://github.com/gimhol/little-fighter-2-WEMAKE"
          target="_blank" draggable={false}
          title={t('goto_github')}>
          <img src={img_github_mark_white} width="20px" alt={t('goto_github')} />
        </a>
        <a
          className={styles.head_right_btn}
          href="https://gim.ink"
          target="_blank" draggable={false}
          title={t('goto_gimink')}>
          <img src={img_gim_ink} width="26px" alt={t('goto_gimink')} />
        </a>
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
                  <a target="_blank" draggable={false} href={versions?.find(v => v.url)?.url}>
                    {actived_game?.title}
                  </a>
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
                    <span className={styles.btn_span}>{game_desc_open ? '▲' : '▼'}</span>
                  </button>
                </h3>
                {!game_desc_open ? null :
                  <div
                    className={styles.game_desc}
                    dangerouslySetInnerHTML={{ __html: actived_game?.desc }} />
                }
              </div>
          }

          {
            (!is_cards_view || !versions?.length) ? null :
              <div className={classnames(styles.card_list, styles.scrollview)}>
                {
                  versions?.map(version => {
                    const { url, cover, desc, changelog } = version;
                    const win_x64_url = version.get_download_url('win_x64');
                    const default_url = url ?? win_x64_url;
                    return (
                      <Card
                        key={version.id}
                        title={url ? pl_in_browser : win_x64_url ? dl_win_x64 : void 0}
                        onClick={() => {
                          if (!default_url) return;
                          const a = document.createElement('a')
                          a.href = default_url
                          a.target = '_blank'
                          a.click()
                        }}>
                        <div className={styles.card_head}>
                          <div className={styles.left}>
                            <a target="_blank" draggable={false} href={url} onClick={e => url && e.stopPropagation()}>
                              {version.title}
                              <span className={styles.prefix}>
                                {url ? null : ` (${t('version_unavailable')})`}
                              </span>
                            </a>
                          </div>
                          <div className={styles.mid}></div>
                          <div className={styles.right}>
                            {!url ? null :
                              <a title={pl_in_browser} draggable={false} target="_blank" href={url} onClick={e => e.stopPropagation()}>
                                <img src={img_browser_mark_white} width="16px" draggable={false} alt={pl_in_browser} />
                              </a>
                            }
                            {!win_x64_url ? null :
                              <a title={dl_win_x64} draggable={false} target="_blank" href={win_x64_url} onClick={e => e.stopPropagation()}>
                                <img src={img_windows_x64_white} width="16px" draggable={false} alt={dl_win_x64} />
                              </a>
                            }
                          </div>
                        </div>
                        <div className={classnames(styles.card_main)}>
                          {
                            !cover ? null : <div className={classnames(styles.pic_zone)}>
                              <img draggable={false} src={cover} />
                            </div>
                          }
                          {
                            !(desc || changelog) ? null :
                              <div className={classnames(cover ? styles.info_zone_half : styles.info_zone, styles.scrollview)}>
                                {!desc ? null : <div dangerouslySetInnerHTML={{ __html: desc }} />}
                                {!desc || !changelog ? null : <div>Changelog</div>}
                                {!changelog ? null : <><div dangerouslySetInnerHTML={{ __html: changelog }} /></>}
                              </div>
                          }
                          {
                            (cover || desc || changelog) ? null :
                              <div className={classnames(styles.no_content)}>
                                {t('no_content')}
                              </div>
                          }
                        </div>
                        <div className={styles.card_foot}>
                          <div className={styles.left}>
                            <span className={styles.prefix}>
                              {t('author')}
                            </span>
                            <a
                              draggable={false}
                              target='_blank'
                              href={version.author_url}
                              title={t('visit_author_link')}
                              onClick={e => e.stopPropagation()}>
                              {version.author}
                            </a>
                          </div>
                          <div className={styles.mid}>
                          </div>
                          <div className={styles.right}>
                            <span className={styles.prefix}>
                              {t('date')}
                            </span>
                            {version.date}
                          </div>
                        </div>
                      </Card>
                    )
                  })
                }
              </div>
          }
          {
            (is_cards_view || !versions?.length) ? null :
              <div className={classnames(styles.version_list, styles.scrollview)}>
                {
                  versions.map(version => {
                    const { url } = version;
                    const win_x64_url = version.get_download_url('win_x64')
                    return (
                      <div className={styles.version_item} key={version.id}>
                        <div className={styles.row_1}>
                          <h3 className={styles.row_title}>
                            <a target="_blank" draggable={false} href={url}>
                              {version.title}
                              {url ? null : ` (${t('version_unavailable')})`}
                            </a>
                          </h3>
                          <div className={styles.go_div}>
                            {!url ? null :
                              <a title={pl_in_browser} target="_blank" href={url}>
                                <img src={img_browser_mark_white} width="24px" alt={pl_in_browser} />
                              </a>
                            }
                            {!win_x64_url ? null :
                              <a title={dl_win_x64} target="_blank" href={win_x64_url}>
                                <img src={img_windows_x64_white} width="24px" alt={dl_win_x64} />
                              </a>
                            }
                            <div className={styles.el_date}>
                              {version.date}
                            </div>
                          </div>
                        </div>
                        {
                          !version.desc ? null :
                            <div className={styles.el_desc} dangerouslySetInnerHTML={{ __html: version.desc }} />
                        }
                        {
                          !version.desc || !version.changelog ? null :
                            <h4>Changelog</h4>
                        }
                        {
                          !version.changelog ? null : <>
                            <div className={styles.el_changelog} dangerouslySetInnerHTML={{ __html: version.changelog }} />
                          </>
                        }
                      </div>
                    )
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

