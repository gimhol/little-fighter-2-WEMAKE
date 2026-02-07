/* eslint-disable @typescript-eslint/no-explicit-any */
import img_gimink from "@/assets/svg/gimink.svg";
import img_github from "@/assets/svg/github.svg";
import img_menu from "@/assets/svg/menu.svg";
import img_upload from "@/assets/svg/upload.svg";
import { Info } from "@/base/Info";
import { IconButton } from "@/components/button/IconButton";
import { InfoCard } from "@/components/cards/InfoCard";
import { Collapse } from "@/components/collapse/Collapse";
import { Link } from "@/components/link";
import { Loading } from "@/components/loading/LoadingImg";
import { Viewer } from "@/components/markdown/Viewer";
import { Mask } from "@/components/mask";
import { Paths } from "@/Paths";
import { useMovingBg } from "@/useMovingBg";
import { create_click_data_props as click_data_props, submit_visit_event } from "@/utils/events";
import classnames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { ExtraDataFromView } from "./ExtraDataFromView";
import { InfoView } from "./InfoView";
import { LangButton } from "./LangButton";
import { MarkdownButton } from "./MarkdownModal";
import csses from "./styles.module.scss";

const time_str = Math.floor(Date.now() / 60000);
async function fetch_info(url: string, lang: string, init: RequestInit) {
  const resp = await fetch(url, init);
  const raw = await resp.json();
  if (!raw || typeof raw !== 'object') void 0;
  return new Info(raw, lang)
}
async function fetch_info_list(url: string, lang: string, init: RequestInit & { histories?: Map<string, Info> } = {}) {
  const { signal, histories = new Map<string, Info>() } = init;

  const resp = await fetch(url, init);
  const raw_list = await resp.json();
  if (!Array.isArray(raw_list)) throw new Error(`[fetch_info_list] failed, got ${raw_list}`)
  if (signal?.aborted) return;

  const cooked_list: Info[] = [];
  for (const raw_item of raw_list) {
    if (!raw_item) continue;
    if (typeof raw_item === 'object') {
      cooked_list.push(new Info(raw_item, lang))
      continue;
    }
    if (typeof raw_item === 'string') {
      const history_key = `[${lang}]${raw_item}`
      const history = histories.get(history_key) || await fetch_info(raw_item, lang, { signal });
      cooked_list.push(history)
    }
  }
  return cooked_list;
}

export default function MainPage() {
  const { t, i18n } = useTranslation()
  const [games, set_games] = useState<Info[]>()
  const [versions, set_versions] = useState<Info[]>()
  const [actived_game, set_actived_game] = useState<Info>()
  const [games_loading, set_games_loading] = useState(false);
  const [versions_loading, set_versions_loading] = useState(false);
  const [game_desc_open, set_game_desc_open] = useState(window.innerWidth > 480)
  const [is_cards_view, set_is_cards_view] = useState(false)
  const [ss_open, set_ss_open] = useState(false)
  const loading = versions_loading || games_loading
  const { game_in_path } = useParams();

  useEffect(() => {
    submit_visit_event();
  })

  const ref_lang = useRef<'zh' | 'en'>('zh')
  // eslint-disable-next-line react-hooks/refs
  ref_lang.current = i18n.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';

  useMovingBg(document.documentElement)
  const nav = useNavigate()
  useEffect(() => {
    if (!actived_game) return;
    const pn = Paths.All.main_page_with.replace(':game_in_path', actived_game.id);
    nav({ pathname: pn }, { replace: true })
  }, [actived_game, nav])

  useEffect(() => {
    if (!games?.length) {
      set_actived_game(void 0)
      return;
    }
    const a = games.find(v => v.id === game_in_path) ?? games[0]
    set_actived_game(a)
    set_is_cards_view(a?.type == 'cards')
  }, [game_in_path, games])

  useEffect(() => {
    const ab = new AbortController();
    set_games_loading(true)
    fetch_info_list(`games.json?time=${time_str}`, ref_lang.current, { signal: ab.signal })
      .then((list) => {
        if (ab.signal.aborted) return;
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
    const { children: versions, children_url: versions_url } = actived_game;
    if (versions?.length) { set_versions(versions); return; }
    if (!versions_url) return;
    const ab = new AbortController()
    set_versions_loading(true)
    fetch_info_list(versions_url, ref_lang.current, { signal: ab.signal })
      .then(list => {
        if (ab.signal.aborted) return;
        actived_game.children = list
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

  const game_list = !games?.length || games.length <= 1 ? null :
    <div className={classnames(csses.game_list, csses.scrollview)}>
      {games?.map((v) => {
        const cls_name = (actived_game?.id === v.id) ? csses.game_item_actived : csses.game_item
        return (
          <button className={cls_name} key={v.id} onClick={() => {
            set_actived_game(v);
            set_is_cards_view(v.type == 'cards');
            set_game_list_open(false)
          }}>
            {v.short_title}
          </button>
        )
      })}
    </div>

  return <>
    <div className={csses.main_page}>
      <div className={csses.head}>
        <IconButton className={csses.btn_toggle_game_list} onClick={() => set_game_list_open(!game_list_open)} img={img_menu} title={t('menu')} />
        <h1 className={csses.main_title}>
          {t("main_title")}
        </h1>
        <LangButton whenClick={next => {
          console.log(next)
          const next_games = games?.map(v => v.with_lang(next))
          const next_actived_game = next_games?.find(v => v.id === actived_game?.id)
          const next_versions = next_actived_game?.children
          set_actived_game(next_actived_game)
          set_is_cards_view(next_actived_game?.type == 'cards')
          set_games(next_games)
          set_versions(next_versions)
        }} />
        <IconButton
          onClick={() => set_ss_open(true)}
          title={t('submit_extra_data')}
          img={img_upload} />
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
        {game_list}
        <div className={csses.main_right}>
          {
            !actived_game ? null :
              <div className={csses.game_desc_zone}>
                <h3 className={csses.game_title}>
                  <IconButton
                    onClick={() => {
                      set_game_desc_open(!game_desc_open)
                    }}
                    title="▼ or ▲"
                    style={{ transform: `rotateZ(${game_desc_open ? 0 : -90}deg)` }}
                    letter='▼'
                    {...click_data_props({ what: 'hello' })}
                  />
                  <Link href={versions?.find(v => v.url)?.url}>
                    {actived_game?.title}
                  </Link>
                  <div style={{ flex: 1 }}></div>
                  <MarkdownButton info={actived_game} />
                  <IconButton onClick={() => set_is_cards_view(!is_cards_view)} title="Cards or List"
                    letter={is_cards_view ? 'L' : 'C'} />
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
                    return <InfoView info={version} key={version.id} open={idx === 0} />
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
    <Mask
      className={csses.game_list_mask}
      container={() => document.body}
      closeOnMask
      open={game_list_open}
      onClose={() => set_game_list_open(false)}>
      {game_list}
    </Mask>
    <Mask container={() => document.body} open={ss_open} onClose={() => set_ss_open(false)}>
      <ExtraDataFromView />
      <IconButton
        style={{ position: 'absolute', right: 10, top: 10 }}
        letter='✖︎'
        onClick={() => set_ss_open(false)} />
    </Mask>
  </>
}

