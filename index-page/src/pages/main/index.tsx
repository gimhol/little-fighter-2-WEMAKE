/* eslint-disable @typescript-eslint/no-explicit-any */
import img_gimink from "@/assets/svg/gimink.svg";
import img_github from "@/assets/svg/github.svg";
import img_menu from "@/assets/svg/menu.svg";
import img_upload from "@/assets/svg/upload.svg";
import { Info } from "@/base/Info";
import { IconButton } from "@/components/button/IconButton";
import { Loading } from "@/components/loading/LoadingImg";
import { Mask } from "@/components/mask";
import { Paths } from "@/Paths";
import { useMovingBg } from "@/useMovingBg";
import { submit_visit_event } from "@/utils/events";
import classnames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { InfoView } from "../info";
import { ExtraDataFromView } from "./ExtraDataFromView";
import { fetch_info_list } from "./fetch_info_list";
import { LangButton } from "./LangButton";
import csses from "./styles.module.scss";

const time_str = Math.floor(Date.now() / 60000);
export default function MainPage() {
  const { t, i18n } = useTranslation()
  const [games, set_games] = useState<Info[]>()
  const [actived_game, set_actived_game] = useState<Info>()
  const [games_loading, set_games_loading] = useState(false);
  const [ss_open, set_ss_open] = useState(false)
  const { game_in_path } = useParams();
  const loading = games_loading

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
  }, [game_in_path, games])

  useEffect(() => {
    const ab = new AbortController();
    set_games_loading(true)
    fetch_info_list(`games.json?time=${time_str}`, null, ref_lang.current, { signal: ab.signal })
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

  const [game_list_open, set_game_list_open] = useState(false);

  const game_list = !games?.length || games.length <= 1 ? null :
    <div className={classnames(csses.game_list, csses.scrollview)}>
      {games?.map((v) => {
        const cls_name = (actived_game?.id === v.id) ? csses.game_item_actived : csses.game_item
        return (
          <button className={cls_name} key={v.id} onClick={() => {
            set_actived_game(v);
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
        <IconButton
          className={csses.btn_toggle_game_list}
          onClick={() => set_game_list_open(!game_list_open)}
          img={img_menu}
          title={t('menu')} />
        <h1 className={csses.main_title}>
          {t("main_title")}
        </h1>
        <LangButton whenClick={next => {
          const next_games = games?.map(v => v.with_lang(next))
          const next_actived_game = next_games?.find(v => v.id === actived_game?.id)
          set_actived_game(next_actived_game)
          set_games(next_games)
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
        {!actived_game ? null : (
          <InfoView
            info={actived_game}
            className={csses.main_right}
            open={window.innerWidth > 480}
          />
        )}
        <div className={''}>
          {/* {
            (!actived_game) ? null :
              <div className={csses.game_desc_zone}>
                <h3 className={csses.game_title}>
                  <CollapseButton
                    open={game_desc_open}
                    whenChange={set_game_desc_open} />
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
          } */}
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

