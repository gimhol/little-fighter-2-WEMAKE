/* eslint-disable @typescript-eslint/no-explicit-any */
import img_gimink from "@/assets/svg/gimink.svg";
import img_github from "@/assets/svg/github.svg";
import img_menu from "@/assets/svg/menu.svg";
import { Info } from "@/base/Info";
import { IconButton } from "@/components/button/IconButton";
import { InfoCard } from "@/components/cards/InfoCard";
import { Collapse } from "@/components/collapse/Collapse";
import { Link } from "@/components/link";
import { Loading } from "@/components/loading/LoadingImg";
import { Viewer } from "@/components/markdown/Viewer";
import { Paths } from "@/Paths";
import { useMovingBg } from "@/useMovingBg";
import classnames from "classnames";
import QueryString from "qs";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { InfoListItem } from "./InfoListItem";
import { LangButton } from "./LangButton";
import { MarkdownButton, MarkdownModal } from "./MarkdownModal";
import csses from "./styles.module.scss";

const time_str = Math.floor(Date.now() / 60000);

export default function MainPage() {
  const { t, i18n } = useTranslation()
  const [games, set_games] = useState<Info[]>()
  const [versions, set_versions] = useState<Info[]>()
  const [actived_game, set_actived_game] = useState<Info>()
  const [games_loading, set_games_loading] = useState(false);
  const [versions_loading, set_versions_loading] = useState(false);
  const [game_desc_open, set_game_desc_open] = useState(window.innerWidth > 480)
  const [md_open, set_md_open] = useState(false);
  const [is_cards_view, set_is_cards_view] = useState(false)
  const loading = versions_loading || games_loading

  const ref_lang = useRef<'zh' | 'en'>('zh')
  ref_lang.current = i18n.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';

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

  const [game_list_open, set_game_list_open] = useState(false);

  return <>
    <div className={csses.main_page}>
      <div className={csses.head}>
        <IconButton onClick={() => set_game_list_open(!game_list_open)} img={img_menu} title={t('menu')} />
        <h1 className={csses.main_title}>
          {t("main_title")}
        </h1>
        <LangButton whenClick={next => {
          console.log(next)
          const next_games = games?.map(v => v.with_lang(next))
          const next_actived_game = next_games?.find(v => v.id === actived_game?.id)
          const next_versions = next_actived_game?.versions
          set_actived_game(next_actived_game)
          set_is_cards_view(next_actived_game?.type == 'cards')
          set_games(next_games)
          set_versions(next_versions)
        }} />
        <IconButton
          href="https://github.com/gimhol/little-fighter-2-WEMAKE"
          title={t('goto_github')}
          img={img_github} />
        <IconButton
          href="https://gim.ink"
          title={t('goto_gimink')}
          img={img_gimink} />
      </div>
      <div className={csses.main}>
        {
          !games?.length || games.length <= 1 ? null :
            <div className={classnames(csses.game_list, csses.scrollview)}>
              {games?.map((v) => {
                const cls_name = (actived_game?.id === v.id) ? csses.game_item_actived : csses.game_item
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
        <div className={csses.main_right}>
          {
            !actived_game ? null :
              <div className={csses.game_desc_zone}>
                <h3 className={csses.game_title}>
                  <Link href={versions?.find(v => v.url)?.url}>
                    {actived_game?.title}
                  </Link>
                  <div style={{ flex: 1 }}></div>
                  <MarkdownButton info={actived_game} />
                  <IconButton onClick={() => set_is_cards_view(!is_cards_view)} title="Cards or List"
                    letter={is_cards_view ? 'L' : 'C'} />
                  <IconButton onClick={() => set_game_desc_open(!game_desc_open)} title="▼ or ▲"
                    style={{ transform: `rotateZ(${game_desc_open ? 0 : 180}deg)` }}
                    letter='▲' />
                </h3>
                <Collapse open={game_desc_open}>
                  <Viewer content={actived_game?.desc} />
                </Collapse>
              </div>
          }
          {
            (!is_cards_view || !versions?.length) ? null :
              <div className={classnames(csses.card_list, csses.scrollview)}>
                {versions?.map(version => <InfoCard info={version} key={version.id} />)}
              </div>
          }
          {
            (is_cards_view || !versions?.length) ? null :
              <div className={classnames(csses.version_list, csses.scrollview)}>
                {
                  versions.map((version, idx) => {
                    return <InfoListItem info={version} key={version.id} open={idx === 0} />
                  })
                }
              </div>
          }
        </div>
      </div>
      <div className={csses.foot}>
        {/* <a className={styles.link}
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noreferrer">
          粤ICP备2021170807号-1
        </a> */}
      </div>
    </div>
    <Loading big loading={loading} style={{ position: 'absolute', margin: 'auto auto' }} />
    <MarkdownModal
      info={actived_game}
      open={md_open && !!actived_game}
      onClose={() => set_md_open(false)} />
  </>
}

